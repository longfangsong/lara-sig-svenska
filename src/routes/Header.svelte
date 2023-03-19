<script lang="ts">
	import { page } from "$app/stores";
	import {
    Collapse,
    	Navbar, NavbarBrand, NavbarToggler, Nav, NavItem, NavLink, Image
  	} from 'sveltestrap';
	let isOpen = false;
	function handleUpdate(event: any) {
    	isOpen = event.detail.isOpen;
  	}
</script>

<header>
	<Navbar color="light" light expand="md" class="container-fluid">
		<NavbarBrand href="/">Lara Sig Svenska</NavbarBrand>
		<NavbarToggler on:click={() => (isOpen = !isOpen)} />
		<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
			<Nav class="ms-auto" navbar>
      			<NavItem>
        			<NavLink href="/articles">Articles</NavLink>
      			</NavItem>
      			<NavItem>
        			<NavLink href="/words">Words</NavLink>
      			</NavItem>
				<NavItem>
        			<NavLink href="https://github.com/longfangsong/lara-sig-svenska">GitHub</NavLink>
      			</NavItem>
				<NavItem>
      				{#if $page.data.session}
      				  <NavLink href="/auth/signout" class="button" data-sveltekit-preload-data="off">Sign out</NavLink>
      				{:else}
      				  <NavLink href="/auth/signin" class="buttonPrimary" data-sveltekit-preload-data="off">Sign in</NavLink>
      				{/if}
    			</NavItem>
				{#if $page.data.session?.user?.image}
					<NavItem>
						<Image thumbnail src="{$page.data.session.user.image}"
							class="d-inline-block"
							style="max-width: 40px;"
						/>
					</NavItem>
				{/if}
			</Nav>
		</Collapse>
	</Navbar>
</header>

<style>
</style>
