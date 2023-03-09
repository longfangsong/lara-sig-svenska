import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import { GITHUB_ID, GITHUB_SECRET, GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private";
import Google from '@auth/core/providers/google';
export const handle = SvelteKitAuth({
  providers: [
    GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET }),
    Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET }),
  ],
});
