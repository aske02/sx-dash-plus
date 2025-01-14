export function getLookupContainerFromHeaderText<R, D>(headerText: string, getReturnValue: (element: HTMLElement) => R | undefined, defaults: D): R | D {
	const headers = document.querySelectorAll<HTMLElement>('h3.panel-title')
	console.log(`LOOKING FOR ${headerText}`)

	for (const element of headers) {
		console.log(`CHECKING ${element.textContent}`)
		if (element.textContent?.includes(headerText)) {
			console.log(`MATCHED ${element.textContent}`)
			const returnValue = getReturnValue(element)

			if (returnValue) {
				return returnValue
			}
		}
	}

	return defaults
}

const steamidPattern = /STEAM_\d:\d:\d+/g
const blacklistedLookup = ['STEAM_0:1:48016748', 'STEAM_0:0:56939043']

export function handleTextNode(textNode: Node): void {
	const origText = textNode.textContent
	const newHtml = origText?.replaceAll(steamidPattern, (match) => {
		if (blacklistedLookup.includes(match)) {
			return match
		}

		return `<a class="lookup-sxplus" href="https://stavox.dk/dash/lookup?lookupid=${match}">${match}</a>`
	})

	if (newHtml && origText && newHtml !== origText) {
		const newSpan = document.createElement('span')
		newSpan.innerHTML = newHtml
		textNode.parentNode?.replaceChild(newSpan, textNode)
	}
}

const nodeNameSkip = ['SCRIPT', 'STYLE']

/** Creates a tree walker, starting on the given node, and uses it to generate links on all text nodes found that contain a steamid, to the relevant lookup page. */
export function processTextNodes(start: Node): void {
	const treeWalker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT, {
		'acceptNode': function (node) {
			if (node.textContent?.length === 0) {
				return NodeFilter.FILTER_SKIP
			}

			const nodeName = node.parentNode?.nodeName
			if (nodeName && nodeNameSkip.includes(nodeName)) {
				return NodeFilter.FILTER_SKIP
			}

			return NodeFilter.FILTER_ACCEPT
		},
	})

	const nodeList = []
	while (treeWalker.nextNode()) {
		nodeList.push(treeWalker.currentNode)
	}

	nodeList.forEach(function (el) {
		handleTextNode(el)
	})
}

export const userIsStaff = (() => {
	for (const element of document.querySelectorAll('.sidebar__title')) {
		if (element.textContent == ' Staff') {
			return true
		}
	}

	return false
})()
