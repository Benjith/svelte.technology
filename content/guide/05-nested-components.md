---
title: Nested components
---

As well as containing elements (and `if` blocks and `each` blocks), Svelte components can contain *other* Svelte components.

```html
<!-- { title: 'Nested components' } -->
<div class='widget-container'>
	<Widget foo bar="static" baz={dynamic}/>
</div>

<script>
	import Widget from './Widget.html';

	export default {
		data() {
			return {
				dynamic: 'this can change'
			}
		},

		components: {
			Widget
		}
	};
</script>
```

```html
<!-- { filename: 'Widget.html', hidden: true } -->
<p>foo: {foo}</p>
<p>bar: {bar}</p>
<p>baz: {baz}</p>
```

The example above is equivalent to the following...

```js
import Widget from './Widget.html';

const widget = new Widget({
	target: document.querySelector('.widget-container'),
	data: {
		foo: true,
		bar: 'static',
		baz: 'this can change'
	}
});
```

For a detailed description of the relationship of data between components, see the section on [passing data](guide#passing-data) and [binding data](guide#binding-data).

> Component names must be capitalised, following the widely-used JavaScript convention of capitalising constructor names. It's also an easy way to distinguish components from elements in your template.

There's a shorthand way to specify that a component uses another component. Instead of importing and referencing it like this

```html
<!-- { repl: false } -->
<script>
	import Widget from './Widget.html';
	export default {
		components: { Widget }
	};
</script>
```

you can write

```html
<!-- { repl: false } -->
<script>
	export default {
		components: { Widget: './Widget.html' }
	};
</script>
```

and Svelte will write the `import` for you.


### Composing with `<slot>`

A component can contain a `<slot></slot>` element, which allows the parent component to inject content:

```html
<!-- { title: 'Using <slot>' } -->
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>

<script>
	import Box from './Box.html';

	export default {
		components: { Box }
	};
</script>
```

```html
<!--{ filename: 'Box.html' }-->
<div class="box">
	<slot><!-- content is injected here --></slot>
</div>

<style>
	.box {
		border: 2px solid black;
		padding: 0.5em;
	}
</style>
```

The `<slot>` element can contain 'fallback content', which will be used if no children are provided for the component:

```html
<!-- { title: 'Default slot content' } -->
<Box></Box>

<script>
	import Box from './Box.html';

	export default {
		components: { Box }
	};
</script>
```

```html
<!--{ filename: 'Box.html' }-->
<div class="box">
	<slot>
		<p class="fallback">the box is empty!</p>
	</slot>
</div>

<style>
	.box {
		border: 2px solid black;
		padding: 0.5em;
	}

	.fallback {
		color: #999;
	}
</style>
```

You can also have *named* slots. Any elements with a corresponding `slot` attribute will fill these slots:

```html
<!-- { title: 'Named slots' } -->
<ContactCard>
	<span slot="name">P. Sherman</span>
	<span slot="address">42 Wallaby Way, Sydney</span>
</ContactCard>

<script>
	import ContactCard from './ContactCard.html';

	export default {
		components: { ContactCard }
	};
</script>
```

```html
<!--{ filename: 'ContactCard.html' }-->
<div class="contact-card">
	<h2><slot name="name"></slot></h2>
	<slot name="address">Unknown address</slot>
	<br>
	<slot name="email">Unknown email</slot>
</div>

<style>
	.contact-card {
		border: 2px solid black;
		padding: 0.5em;
	}
</style>
```