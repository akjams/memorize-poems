import './style.css'

interface SavedPoem {
	title: string
	poemText: string
	fontScale: number
	lineHeight: number
	configureableBreakAreas: number[]
}

class PoemTextFormatter {
	private poem: string

	constructor(poem: string) {
		this.poem = poem
	}

	getHintLetters(): string {
		return this.poem.split(/\r?\n/).map(line => {
			if (line.trim() === '') return ''
			const words = line.trim().split(/\s+/)
			return words.map(word => {
				const firstLetter = word.match(/[a-zA-Z]/)?.[0]
				return firstLetter ? firstLetter.toLowerCase() : ''
			}).join(' ')
		}).join('\n')
	}

	getHintLettersWithoutSpaces(): string {
		return this.poem.split(/\r?\n/).map(line => {
			if (line.trim() === '') return ''
			const words = line.trim().split(/\s+/)
			return words.map(word => {
				const firstLetter = word.match(/[a-zA-Z]/)?.[0]
				return firstLetter ? firstLetter.toLowerCase() : ''
			}).join('')
		}).join('\n')
	}

	getLyrics(): string {
		return this.poem
	}

	getMarkup(): string {
		const lines = this.poem.split(/\r?\n/)
		const buffer: string[] = []
		const data: Array<{hints: string, lyric: string}> = []

		// First pass: collect all hint/lyric pairs and find max hint width
		let maxHintWidth = 0
		for (const line of lines) {
			if (line.trim() === '') {
				data.push({hints: '', lyric: ''})
				continue
			}

			const words = line.trim().split(/\s+/)
			const hints = words.map(word => {
				const firstLetter = word.match(/[a-zA-Z]/)?.[0]
				return firstLetter ? firstLetter.toLowerCase() : ''
			}).join('')

			data.push({hints, lyric: line.trim()})
			if (hints.length > maxHintWidth) {
				maxHintWidth = hints.length
			}
		}

		// Second pass: format with proper padding
		for (const {hints, lyric} of data) {
			if (lyric === '') {
				buffer.push('')
				continue
			}

			const paddingNeeded = maxHintWidth - hints.length + 2
			const padding = ' '.repeat(paddingNeeded)
			buffer.push(hints + padding + lyric)
		}

		return buffer.join('\n')
	}

	getOneAfterOther(): string {
		const lines = this.poem.split(/\r?\n/)
		const hintLines: string[] = []
		
		// Generate hint lines for each line of the poem
		lines.forEach(line => {
			if (line.trim() !== '') {
				const words = line.trim().split(/\s+/)
				const hints = words.map(word => {
					const firstLetter = word.match(/[a-zA-Z]/)?.[0]
					return firstLetter ? firstLetter.toLowerCase() : ''
				}).join(' ')
				hintLines.push(hints)
			} else {
				hintLines.push('')
			}
		})
		
		// Return all lyrics, then 2 newlines, then all hints
		return this.poem + '\n\n' + hintLines.join('\n')
	}

	getAnkiCloze(): string {
		const stanzas = this.poem.split(/\n\s*\n/)
		const clozeCards: string[] = []
		
		stanzas.forEach((stanza, index) => {
			if (stanza.trim() === '') return
			
			const lines = stanza.split(/\n/).filter(line => line.trim() !== '')
			const fullText = lines.join('\n')
			
			const hintText = lines.map(line => {
				const words = line.trim().split(/\s+/)
				return words.map(word => {
					const firstLetter = word.match(/[a-zA-Z]/)?.[0]
					return firstLetter ? firstLetter.toLowerCase() : ''
				}).join('')
			}).join('\n')
			
			const clozeNumber = index + 1
			const clozeCard = `{{c${clozeNumber}::${fullText}\n::\n${hintText}\n}}`
			clozeCards.push(clozeCard)
		})
		
		return clozeCards.join('\n\n')
	}
}

const MAX_TITLE_LENGTH = 20
const STORAGE_KEY = 'memorize-poems-saved'

const poemInput = document.querySelector<HTMLTextAreaElement>('#poemInput')!
const titleInput = document.querySelector<HTMLInputElement>('#titleInput')!
const fontScale = document.querySelector<HTMLInputElement>('#fontScale')!
const fontScaleNumber = document.querySelector<HTMLInputElement>('#fontScaleNumber')!
const lineHeight = document.querySelector<HTMLInputElement>('#lineHeight')!
const lineHeightNumber = document.querySelector<HTMLInputElement>('#lineHeightNumber')!
const printButton = document.querySelector<HTMLButtonElement>('#printButton')!
const saveButton = document.querySelector<HTMLButtonElement>('#saveButton')!
const ankiClozeButton = document.querySelector<HTMLButtonElement>('#ankiClozeButton')!
const copyHintButton = document.querySelector<HTMLButtonElement>('#copyHintButton')!
const copyHintNoSpacesButton = document.querySelector<HTMLButtonElement>('#copyHintNoSpacesButton')!
const copyLyricsButton = document.querySelector<HTMLButtonElement>('#copyLyricsButton')!
const copyLineByLineButton = document.querySelector<HTMLButtonElement>('#copyLineByLineButton')!
const copyOneAfterOtherButton = document.querySelector<HTMLButtonElement>('#copyOneAfterOtherButton')!
const poemForm = document.querySelector<HTMLFormElement>('#poemForm')!
const poemGrid = document.querySelector<HTMLDivElement>('#poemGrid')!
const poemTitle = document.querySelector<HTMLHeadingElement>('#poemTitle')!
const contentInfo = document.querySelector<HTMLDivElement>('#contentInfo')!

const menuButton = document.querySelector<HTMLButtonElement>('#menuButton')!
const helpButton = document.querySelector<HTMLButtonElement>('#helpButton')!
const savedPoemsMenu = document.querySelector<HTMLDivElement>('#savedPoemsMenu')!
const helpPopup = document.querySelector<HTMLDivElement>('#helpPopup')!
const closeMenuButton = document.querySelector<HTMLButtonElement>('#closeMenuButton')!
const closeHelpButton = document.querySelector<HTMLButtonElement>('#closeHelpButton')!
const savedPoemsList = document.querySelector<HTMLDivElement>('#savedPoemsList')!
const cutNewlinesButton = document.querySelector<HTMLButtonElement>('#cutNewlinesButton')!

// Global state for configurable break areas
let configureableBreakAreas: number[] = []

function wrapLine(line: string, fontSize: number): string[] {
	// More accurate calculation based on actual available space
	const charWidth = fontSize * 0.55 // Slightly tighter estimate for serif font
	const pageWidth = 7.5 * 96 // 7.5 inches at 96 DPI
	const wordsCount = line.trim().split(/\s+/).length
	const hintWidth = wordsCount * fontSize * 0.8 // Hint letters take less space
	const gapWidth = fontSize * 1.5 // Minimum gap between columns
	const availableWidth = pageWidth - hintWidth - gapWidth
	const maxLen = Math.floor(availableWidth / charWidth)
	
	const words = line.trim().split(/\s+/)
	if (words.length === 0) return []
	
	// Don't wrap unless absolutely necessary
	if (line.length <= maxLen) return [line.trim()]
	
	const lines: string[] = []
	let current = words[0]
	
	for (let i = 1; i < words.length; i++) {
		const word = words[i]
		const testLine = current + ' ' + word
		
		if (testLine.length > maxLen && current.length > 0) {
			lines.push(current)
			current = word
		} else {
			current = testLine
		}
	}
	
	if (current) lines.push(current)
	return lines
}

async function copyWithFeedback(button: HTMLButtonElement, text: string, isMonospaced: boolean = false): Promise<void> {
	try {
		if (isMonospaced && navigator.clipboard.write) {
			// Try to copy with monospaced formatting
			const htmlContent = `<pre style="font-family: 'Courier New', Consolas, monospace;">${text.replace(/\n/g, '<br>')}</pre>`
			const clipboardItem = new ClipboardItem({
				'text/html': new Blob([htmlContent], { type: 'text/html' }),
				'text/plain': new Blob([text], { type: 'text/plain' })
			})
			await navigator.clipboard.write([clipboardItem])
		} else {
			await navigator.clipboard.writeText(text)
		}
		const originalText = button.textContent
		const originalBg = button.style.backgroundColor
		button.textContent = 'Copied!'
		button.style.backgroundColor = '#4CAF50'
		setTimeout(() => {
			button.textContent = originalText
			button.style.backgroundColor = originalBg
		}, 2000)
	} catch (err) {
		console.error('Failed to copy text: ', err)
		alert('Failed to copy to clipboard')
	}
}

function identifyBreakAreas(poem: string, title: string): { areas: number[], spacing: number[] } {
	const areas: number[] = []
	const spacing: number[] = []
	let areaIndex = 0

	// Break area 0: between title and first stanza (if title exists)
	if (title.trim()) {
		areas.push(areaIndex++)
		spacing.push(1) // Always 1 spacer between title and content
	}

	// Find stanza breaks by splitting on double newlines
	const stanzaSections = poem.split(/\n\s*\n/)

	// Create break areas between stanzas
	for (let i = 0; i < stanzaSections.length - 1; i++) {
		areas.push(areaIndex++)
		// Count how many blank lines were between these stanzas in the original
		// For now, assume 1 blank line = 1 spacer (user can adjust)
		spacing.push(1) // Start with 1 spacer, user can add/remove
	}

	console.log('Detected break areas:', areas, 'with spacing:', spacing)
	console.log('Stanza sections:', stanzaSections.length)
	return { areas, spacing }
}

function createBreakAreaUI(areaId: number, spacerCount: number): void {
	// Always create the control buttons container, even for 0 spacers
	const container = document.createElement('div')
	container.className = 'configurable-break-area'
	container.dataset.areaId = areaId.toString()

	const controls = document.createElement('div')
	controls.className = 'break-controls'

	const addBtn = document.createElement('button')
	addBtn.className = 'break-control-btn'
	addBtn.textContent = '+'
	addBtn.onclick = () => adjustBreakArea(areaId, 1)

	const removeBtn = document.createElement('button')
	removeBtn.className = 'break-control-btn'
	removeBtn.textContent = '−'
	removeBtn.onclick = () => adjustBreakArea(areaId, -1)

	controls.appendChild(addBtn)
	controls.appendChild(removeBtn)
	container.appendChild(controls)

	// Add the controls container to the grid
	poemGrid.appendChild(container)

	// Add the actual spacer lines (only if spacerCount > 0)
	for (let i = 0; i < spacerCount; i++) {
		const spacer = document.createElement('div')
		spacer.className = 'break-area-spacer'
		spacer.innerHTML = '&nbsp;'
		poemGrid.appendChild(spacer)
	}
}

function adjustBreakArea(areaId: number, delta: number) {
	console.log(`Adjusting break area ${areaId} by ${delta}`)
	const currentCount = configureableBreakAreas[areaId] ?? 1 // Use ?? to distinguish 0 from undefined
	const newCount = Math.max(0, Math.min(8, currentCount + delta)) // 0-8 range (0 = no spacing, stanzas touch)
	console.log(`Break area ${areaId}: ${currentCount} -> ${newCount}`)
	configureableBreakAreas[areaId] = newCount

	// Regenerate the preview
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
}

function generatePrintable(poem: string, title: string = '') {
	poemGrid.innerHTML = ''

	if (title.trim()) {
		poemTitle.textContent = title
		poemTitle.style.display = 'block'
	} else {
		poemTitle.style.display = 'none'
	}

	const scale = parseInt(fontScale.value) / 100
	const fontSize = 16 * scale
	const lineHeightValue = parseFloat(lineHeight.value)
	poemGrid.style.fontSize = `${fontSize}px`
	poemGrid.style.lineHeight = lineHeightValue.toString()

	// Initialize break areas if empty
	const breakInfo = identifyBreakAreas(poem, title)
	if (configureableBreakAreas.length === 0) {
		configureableBreakAreas = [...breakInfo.spacing]
		console.log('Initialized break areas:', configureableBreakAreas)
	}
	
	const lines = poem.split(/\r?\n/)
	let currentBreakArea = 0
	let inStanza = false
	let stanzaCount = 0

	// Add break area after title if title exists
	if (title.trim() && currentBreakArea < breakInfo.areas.length) {
		const breakCount = configureableBreakAreas[currentBreakArea] ?? 1
		createBreakAreaUI(currentBreakArea, breakCount)
		currentBreakArea++
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const isEmpty = line.trim() === ''

		if (!isEmpty && !inStanza) {
			// Starting a new stanza
			inStanza = true
			stanzaCount++
		} else if (isEmpty && inStanza) {
			// End of stanza, add break area if there's more content
			inStanza = false
			const hasMoreContent = lines.slice(i + 1).some(l => l.trim() !== '')
			if (hasMoreContent && currentBreakArea < breakInfo.areas.length) {
				const breakCount = configureableBreakAreas[currentBreakArea] ?? 1
				createBreakAreaUI(currentBreakArea, breakCount)
				currentBreakArea++
			}
			continue
		}

		if (isEmpty) {
			// Skip empty lines that aren't stanza breaks
			continue
		}

		// Process non-empty lines
		const wraps = wrapLine(line, fontSize)
		for (const subline of wraps) {
			const words = subline.trim().split(/\s+/)

			const left = document.createElement('div')
			left.className = 'poemLine poemText'
			left.textContent = subline

			const right = document.createElement('div')
			right.className = 'poemLine hintText'
			right.textContent = words.map(w => {
				const firstLetter = w.match(/[a-zA-Z]/)?.[0]
				return firstLetter ? firstLetter.toLowerCase() : ''
			}).join(' ')

			poemGrid.append(left, right)
		}
	}
	
	// Calculate content height and line wrapping status
	setTimeout(() => {
		const gridHeight = poemGrid.offsetHeight
		const titleHeight = poemTitle.style.display !== 'none' ? poemTitle.offsetHeight : 0
		const totalHeight = gridHeight + titleHeight
		const pageHeight = 10 * 96 // 10 inches at 96 DPI
		
		// Check if any lines were wrapped
		const originalLines = poem.split(/\r?\n/).filter(line => line.trim() !== '').length
		const displayedLines = poemGrid.querySelectorAll('.poemText').length - poem.split(/\r?\n/).filter(line => line.trim() === '').length
		const brokenLinesCount = displayedLines - originalLines
		const hasWrappedLines = brokenLinesCount > 0
		
		if (totalHeight > pageHeight) {
			const pagesNeeded = Math.ceil(totalHeight / pageHeight)
			const suggestedScale = Math.floor((pageHeight / totalHeight) * scale * 100)
			contentInfo.innerHTML = `
				<div style="color: #ffcc66;">⚠️ Fits on ${pagesNeeded} pages</div>
				<div>Try scale: ${suggestedScale}%</div>
				<div style="color: ${hasWrappedLines ? '#ffcc66' : '#99ff99'};">
					${hasWrappedLines ? `⚠️ ${brokenLinesCount} lines broken` : '✓ No lines broken'}
				</div>
			`
		} else {
			contentInfo.innerHTML = `
				<div style="color: #99ff99;">✓ Fits on one page</div>
				<div style="color: ${hasWrappedLines ? '#ffcc66' : '#99ff99'};">
					${hasWrappedLines ? `⚠️ ${brokenLinesCount} lines broken` : '✓ No lines broken'}
				</div>
			`
		}
	}, 0)
}

function cutNonstanzaNewlines(text: string): string {
	// Replace double newlines with single newlines
	let result = text.replace(/\n\n/g, '\n')
	// Replace any remaining sequences of 2+ newlines with double newlines (for stanza breaks)
	result = result.replace(/\n{2,}/g, '\n\n')
	return result
}

// Main

poemInput.value = `If we didn't have birthdays, you wouldn't be you.
If you’d never been born, well then what would you do?
If you’d never been born, well then what would you be?
You might be a fish! Or a toad in a tree!

You might be a doorknob! Or three baked potatoes!
You might be a bag full of hard green tomatoes.
Or worse than all that… Why, you might be a WASN’T!
A Wasn’t has no fun at all. No, he doesn’t.
A Wasn’t just isn’t. He just isn’t present.
But you…You ARE YOU! And, now isn’t that pleasant!

Today you are you! That is truer than true!
There is no one alive who is you-er than you!
Shout loud, “I am lucky to be what I am!
Thank goodness I’m not just a clam or a ham
Or a dusty old jar of sour gooseberry jam!
I am what I am! That’s a great thing to be!
If I say so myself, HAPPY BIRTHDAY TO ME!"`


fontScale.addEventListener('input', () => {
	fontScaleNumber.value = fontScale.value
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
})

lineHeight.addEventListener('input', () => {
	lineHeightNumber.value = lineHeight.value
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
})

lineHeightNumber.addEventListener('input', () => {
	const value = Math.max(1.0, parseFloat(lineHeightNumber.value) || 1.4)
	lineHeightNumber.value = value.toString()
	// Only sync slider if value is within slider range
	if (value <= 8.0) {
		lineHeight.value = value.toString()
	}
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
})

fontScaleNumber.addEventListener('input', () => {
	const value = Math.min(150, Math.max(60, parseInt(fontScaleNumber.value) || 100))
	fontScaleNumber.value = value.toString()
	fontScale.value = value.toString()
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
})

printButton.addEventListener('click', () => {
	window.print()
})

poemInput.addEventListener('input', () => {
	// Reset break areas when poem changes
	configureableBreakAreas = []
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
})

titleInput.addEventListener('input', () => {
	if (poemInput.value) {
		generatePrintable(poemInput.value, titleInput.value)
	}
})

poemInput.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key === 'Enter' && e.ctrlKey) {
		e.preventDefault()
		poemForm.requestSubmit()
	}
})

function generateTitleFromPoem(poemText: string): string {
	const firstLine = poemText.split('\n')[0] || ''
	const trimmed = firstLine.trim()
	
	if (trimmed.length <= MAX_TITLE_LENGTH) {
		return trimmed
	}
	
	// Try to cut at word boundary
	const cutIndex = trimmed.lastIndexOf(' ', MAX_TITLE_LENGTH)
	if (cutIndex > 0) {
		return trimmed.substring(0, cutIndex) + '...'
	}
	
	// No spaces found, just cut at MAX_TITLE_LENGTH
	return trimmed.substring(0, MAX_TITLE_LENGTH) + '...'
}

function getSavedPoems(): SavedPoem[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return []
		
		const poems = JSON.parse(stored)
		if (!Array.isArray(poems)) {
			console.warn('Invalid saved poems format, expected array')
			return []
		}
		
		// Validate each poem
		return poems.filter(poem => {
			if (typeof poem !== 'object' || !poem) {
				console.warn('Invalid poem object:', poem)
				return false
			}
			if (typeof poem.title !== 'string' || typeof poem.poemText !== 'string' || typeof poem.fontScale !== 'number') {
				console.warn('Invalid poem properties:', poem)
				return false
			}
			// Handle legacy poems without lineHeight
			if (poem.lineHeight === undefined) {
				poem.lineHeight = 1.4
			}
			// Handle legacy poems without configureableBreakAreas
			if (!poem.configureableBreakAreas) {
				const breakInfo = identifyBreakAreas(poem.poemText, poem.title)
				poem.configureableBreakAreas = [...breakInfo.spacing]
			}
			return true
		})
	} catch (e) {
		console.warn('Error loading saved poems:', e)
		return []
	}
}

function savePoem() {
	const poemText = poemInput.value.trim()
	if (!poemText) return
	
	const title = titleInput.value.trim() || generateTitleFromPoem(poemText)
	const scale = parseInt(fontScale.value)
	const lineHeightValue = parseFloat(lineHeight.value)

	const savedPoems = getSavedPoems()
	const newPoem: SavedPoem = {
		title,
		poemText,
		fontScale: scale,
		lineHeight: lineHeightValue,
		configureableBreakAreas: [...configureableBreakAreas]
	}
	
	// Check if poem with same title exists
	const existingIndex = savedPoems.findIndex(p => p.title === title)
	if (existingIndex >= 0) {
		savedPoems[existingIndex] = newPoem
	} else {
		savedPoems.push(newPoem)
	}
	
	localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPoems))
	updateSavedPoemsList()
}

function loadPoem(poem: SavedPoem) {
	titleInput.value = poem.title
	poemInput.value = poem.poemText
	fontScale.value = poem.fontScale.toString()
	fontScaleNumber.value = poem.fontScale.toString()
	lineHeight.value = (poem.lineHeight || 1.4).toString()
	lineHeightNumber.value = (poem.lineHeight || 1.4).toString()

	// Load break areas or initialize defaults
	if (poem.configureableBreakAreas) {
		configureableBreakAreas = [...poem.configureableBreakAreas]
	} else {
		// Initialize for legacy poems using actual spacing
		const breakInfo = identifyBreakAreas(poem.poemText, poem.title)
		configureableBreakAreas = [...breakInfo.spacing]
	}

	generatePrintable(poem.poemText, poem.title)
	savedPoemsMenu.classList.remove('open')
}

function deletePoem(title: string) {
	const savedPoems = getSavedPoems()
	const filtered = savedPoems.filter(p => p.title !== title)
	localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
	updateSavedPoemsList()
}

function updateSavedPoemsList() {
	const savedPoems = getSavedPoems()
	
	if (savedPoems.length === 0) {
		savedPoemsList.innerHTML = '<p class="no-poems">No saved poems yet</p>'
		return
	}
	
	savedPoemsList.innerHTML = ''
	savedPoems.forEach(poem => {
		const item = document.createElement('div')
		item.className = 'saved-poem-item'
		
		const titleBtn = document.createElement('button')
		titleBtn.className = 'saved-poem-title'
		titleBtn.textContent = poem.title
		titleBtn.onclick = () => loadPoem(poem)
		
		const deleteBtn = document.createElement('button')
		deleteBtn.className = 'delete-poem-button'
		deleteBtn.textContent = '×'
		deleteBtn.title = 'Delete poem'
		deleteBtn.onclick = (e) => {
			e.stopPropagation()
			if (confirm(`Delete "${poem.title}"?`)) {
				deletePoem(poem.title)
			}
		}
		
		item.appendChild(titleBtn)
		item.appendChild(deleteBtn)
		savedPoemsList.appendChild(item)
	})
}

// Event listeners for menu and popup
menuButton.addEventListener('click', () => {
	updateSavedPoemsList()
	savedPoemsMenu.classList.add('open')
})

closeMenuButton.addEventListener('click', () => {
	savedPoemsMenu.classList.remove('open')
})

helpButton.addEventListener('click', () => {
	helpPopup.classList.add('open')
})

closeHelpButton.addEventListener('click', () => {
	helpPopup.classList.remove('open')
})

// Close on overlay click
savedPoemsMenu.addEventListener('click', (e) => {
	if (e.target === savedPoemsMenu) {
		savedPoemsMenu.classList.remove('open')
	}
})

helpPopup.addEventListener('click', (e) => {
	if (e.target === helpPopup) {
		helpPopup.classList.remove('open')
	}
})

saveButton.addEventListener('click', savePoem)

ankiClozeButton.addEventListener('click', async () => {
	const poemText = poemInput.value.trim()
	if (!poemText) return
	
	const formatter = new PoemTextFormatter(poemText)
	await copyWithFeedback(ankiClozeButton, formatter.getAnkiCloze())
})

copyHintButton.addEventListener('click', async () => {
	const poemText = poemInput.value.trim()
	if (!poemText) return

	const formatter = new PoemTextFormatter(poemText)
	await copyWithFeedback(copyHintButton, formatter.getHintLetters())
})

copyHintNoSpacesButton.addEventListener('click', async () => {
	const poemText = poemInput.value.trim()
	if (!poemText) return

	const formatter = new PoemTextFormatter(poemText)
	await copyWithFeedback(copyHintNoSpacesButton, formatter.getHintLettersWithoutSpaces())
})

copyLyricsButton.addEventListener('click', async () => {
	const poemText = poemInput.value.trim()
	if (!poemText) return
	
	const formatter = new PoemTextFormatter(poemText)
	await copyWithFeedback(copyLyricsButton, formatter.getLyrics())
})

copyLineByLineButton.addEventListener('click', async () => {
	const poemText = poemInput.value.trim()
	if (!poemText) return

	const formatter = new PoemTextFormatter(poemText)
	await copyWithFeedback(copyLineByLineButton, formatter.getMarkup(), true)
})

copyOneAfterOtherButton.addEventListener('click', async () => {
	const poemText = poemInput.value.trim()
	if (!poemText) return

	const formatter = new PoemTextFormatter(poemText)
	await copyWithFeedback(copyOneAfterOtherButton, formatter.getOneAfterOther())
})

cutNewlinesButton.addEventListener('click', () => {
	const currentText = poemInput.value
	const editedText = cutNonstanzaNewlines(currentText)
	poemInput.value = editedText

	if (editedText) {
		generatePrintable(editedText, titleInput.value)
	}
})

// Add double-click to select all poem or hint text
poemGrid.addEventListener('dblclick', (e) => {
	const target = e.target as HTMLElement
	if (!target.classList.contains('poemText') && !target.classList.contains('hintText')) return
	
	e.preventDefault()
	const isPoem = target.classList.contains('poemText')
	const textElements = isPoem 
		? Array.from(poemGrid.querySelectorAll('.poemText'))
		: Array.from(poemGrid.querySelectorAll('.hintText'))
	
	const text = textElements.map(el => el.textContent || '').join('\n')
	
	// Select all text elements visually
	const selection = window.getSelection()
	if (selection) {
		selection.removeAllRanges()
		const range = document.createRange()
		
		if (textElements.length > 0) {
			range.setStartBefore(textElements[0])
			range.setEndAfter(textElements[textElements.length - 1])
			selection.addRange(range)
		}
	}
	
	// Copy to clipboard
	navigator.clipboard.writeText(text).catch(err => {
		console.error('Failed to copy text: ', err)
	})
})

generatePrintable(poemInput.value)
