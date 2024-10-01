import * as fs from "fs";
import fetch from "node-fetch";
import { pipeline } from "stream/promises";
import { load } from "cheerio";

interface Lexeme {
  definition: string;
  example: string | null;
  example_meaning: string | null;
  source: string;
}

async function fetchFile(filePath: string, url: string) {
  if (!fs.existsSync(filePath)) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await pipeline(response.body as any, fs.createWriteStream(filePath));
      console.log(`File fetched and saved as ${filePath}`);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  } else {
    console.log(`File already exists: ${filePath}`);
  }
}

function formatNullableString(value: string | null) {
  if (value !== null) {
    return `'${value.replace("'", "''")}'`;
  }
  return "NULL";
}

function extractLemmaInfo($: cheerio.Root, element: cheerio.Element) {
  const phonetic = $(element).children("Phonetic");
  let phoneticFile = phonetic.attr("file");
  if (phoneticFile && !phoneticFile.startsWith("v2")) {
    phoneticFile = phoneticFile
      .replace(/ö/g, "0366")
      .replace(/å/g, "0345")
      .replace(/ä/g, "0344");
  }
  const lemmaInfo = {
    lemma: $(element).attr("value")!,
    part_of_speech: $(element).attr("type")!,
    phonetic: phonetic.children().remove().end().text().trim(),
    phoneticUrl: phonetic.attr("file")
      ? `http://lexin.nada.kth.se/sound/${phoneticFile}`
      : null,
    indexes: [] as Array<string>,
    inflections: [] as Array<{ form: string; value: string }>,
    lexemes: [] as Array<Lexeme>,
  };
  $(element)
    .find("Inflection")
    .each((_, inflectionElement) => {
      if ($(inflectionElement).text() !== "–") {
        lemmaInfo.inflections.push({
          form: $(inflectionElement).attr("form")!,
          value: $(inflectionElement).text(),
        });
      }
    });

  $(element)
    .find("Index")
    .each((_, indexElement) => {
      lemmaInfo.indexes.push($(indexElement).attr("value")!);
    });

  $(element)
    .find("Lexeme")
    .each((_, lexemeElement) => {
      lemmaInfo.lexemes.push({
        definition:
          $(lexemeElement).children("Definition").text() ||
          $(lexemeElement).find("Comment[Type='Def']").text(),
        example: $(lexemeElement).find("Example").text() || null,
        example_meaning: null,
        source: "lexin-swe",
      });
    });

  const wholeFrom = lemmaInfo.lemma.replace(/\|/g, "");
  switch (lemmaInfo.part_of_speech) {
    case "subst.":
      lemmaInfo.inflections.push({
        form: "obest.f.sing.",
        value: wholeFrom,
      });
      break;
    case "verb":
      lemmaInfo.inflections.push({ form: "presens", value: wholeFrom });
      break;
    case "adj.":
      lemmaInfo.inflections.push({ form: "nform", value: wholeFrom });
      break;
  }
  if (lemmaInfo.indexes.length === 0) {
    lemmaInfo.indexes.push(wholeFrom);
  }
  return lemmaInfo;
}

function extractEnglishLexemes($: cheerio.Root, lemma: string): Array<Lexeme> {
  let lexemes: Array<Lexeme> = [];
  const safeLemmaName = lemma.replace("'", "&amp;#39;");
  const englishWords = $("word[value='" + safeLemmaName + "']");
  englishWords.each((_, englishWord) => {
    const englishDefinition =
      $(englishWord).find("definition").children("translation").length > 0
        ? $(englishWord)
            .find("definition")
            .children("translation")
            .attr("value")
        : $(englishWord).children("translation").attr("value");
    if (englishDefinition) {
      const englishExample = $(englishWord).find("example");
      const example = englishExample.attr("value") || null;
      const exampleTranslation =
        englishExample.children("translation").attr("value") || null;
      lexemes.push({
        definition: englishDefinition,
        example: example,
        example_meaning: exampleTranslation,
        source: "folkets-lexikon",
      });
    }
  });
  return lexemes;
}

function writeBatch(
  initSqlFile: fs.WriteStream,
  wordBuffer: string,
  wordIndexBuffer: string,
  lexemeBuffer: string,
) {
  if (wordBuffer.endsWith(", ")) {
    wordBuffer = wordBuffer.slice(0, -2);
  }
  if (wordIndexBuffer.endsWith(", ")) {
    wordIndexBuffer = wordIndexBuffer.slice(0, -2);
  }
  if (lexemeBuffer.endsWith(", ")) {
    lexemeBuffer = lexemeBuffer.slice(0, -2);
  }
  if (wordBuffer) {
    initSqlFile.write(
      `INSERT INTO Word (id, lemma, part_of_speech, phonetic, phonetic_voice, phonetic_url) VALUES ${wordBuffer};\n`,
    );
  }
  if (wordIndexBuffer) {
    initSqlFile.write(
      `INSERT INTO WordIndex (id, word_id, spell, form) VALUES ${wordIndexBuffer};\n`,
    );
  }
  if (lexemeBuffer) {
    initSqlFile.write(
      `INSERT INTO Lexeme (id, word_id, definition, example, example_meaning, source) VALUES ${lexemeBuffer};\n`,
    );
  }
}

async function main() {
  let wordBuffer = "";
  let wordIndexBuffer = "";
  let lexemeBuffer = "";
  const sweUrl = "https://sprakresurser.isof.se/lexin/svenska/swe_swe.xml";
  const sweFilePath = "swe_swe.xml";
  const enUrl =
    "http://folkets-lexikon.csc.kth.se/folkets/folkets_sv_en_public.xml";
  const enFilePath = "swe_en.xml";
  await Promise.all([
    fetchFile(sweFilePath, sweUrl),
    fetchFile(enFilePath, enUrl),
  ]);
  const sweXml = fs.readFileSync(sweFilePath, "utf-8");
  const $swe = load(sweXml);
  const enXml = fs.readFileSync(enFilePath, "utf-8");
  const $en = load(enXml);

  let initSqlFileId = 2;
  let initSqlFile = fs.createWriteStream(
    `000${initSqlFileId}_import_data.sql`,
    {
      flags: "w",
    },
  );
  $swe("Lemma").each((index, element) => {
    const lemmaInfo = extractLemmaInfo($swe, element);
    const englishLexemes = extractEnglishLexemes($en, lemmaInfo.lemma);
    lemmaInfo.lexemes.push(...englishLexemes);
    const wordId = crypto.randomUUID();
    wordBuffer += `('${wordId}', '${lemmaInfo.lemma.replace("'", "''")}', '${
      lemmaInfo.part_of_speech
    }', '${lemmaInfo.phonetic.replace(
      "'",
      "''",
    )}', NULL, ${formatNullableString(lemmaInfo.phoneticUrl)}), `;
    for (const index of lemmaInfo.indexes) {
      const indexId = crypto.randomUUID();
      const form =
        lemmaInfo.inflections.find((inflection) => inflection.value === index)
          ?.form || null;
      wordIndexBuffer += `('${indexId}', '${wordId}', '${index.replace(
        "'",
        "''",
      )}', ${formatNullableString(form)}), `;
    }
    for (const lexeme of lemmaInfo.lexemes) {
      const lexemeId = crypto.randomUUID();
      const example = lexeme.example || null;
      lexemeBuffer += `('${lexemeId}', '${wordId}', '${lexeme.definition.replace(
        "'",
        "''",
      )}', ${formatNullableString(example)}, ${formatNullableString(
        lexeme.example_meaning,
      )}, '${lexeme.source}'), `;
    }
    writeBatch(initSqlFile, wordBuffer, wordIndexBuffer, lexemeBuffer);
    wordBuffer = "";
    wordIndexBuffer = "";
    lexemeBuffer = "";
    if (index % 100 === 99) {
      console.log(lemmaInfo.lemma);
    }
    if (index % 5000 === 4999) {
      initSqlFileId += 1;
      initSqlFile.end();
      initSqlFile = fs.createWriteStream(
        `${initSqlFileId.toString().padStart(4, "0")}_import_data.sql`,
        {
          flags: "w",
        },
      );
    }
  });
  writeBatch(initSqlFile, wordBuffer, wordIndexBuffer, lexemeBuffer);
  initSqlFile.end();
}

main();
