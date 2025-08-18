import './style.css'

const poemInput = document.querySelector<HTMLTextAreaElement>('#poemInput')!
const titleInput = document.querySelector<HTMLInputElement>('#titleInput')!
const fontScale = document.querySelector<HTMLInputElement>('#fontScale')!
const fontScaleNumber = document.querySelector<HTMLInputElement>('#fontScaleNumber')!
const printButton = document.querySelector<HTMLButtonElement>('#printButton')!
const poemForm = document.querySelector<HTMLFormElement>('#poemForm')!
const printable = document.querySelector<HTMLDivElement>('#printable')!
const poemGrid = document.querySelector<HTMLDivElement>('#poemGrid')!
const poemTitle = document.querySelector<HTMLHeadingElement>('#poemTitle')!
const contentInfo = document.querySelector<HTMLDivElement>('#contentInfo')!

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
	poemGrid.style.fontSize = `${fontSize}px`
	
	const lines = poem.split(/\r?\n/)

	for (const line of lines) {
		if (line.trim() === '') {
			const blankLeft = document.createElement('div')
			blankLeft.className = 'poemLine poemText'
			blankLeft.style.minHeight = '1.4em'
			blankLeft.innerHTML = '&nbsp;'

			const blankRight = document.createElement('div')
			blankRight.className = 'poemLine hintText'
			blankRight.style.minHeight = '1.4em'
			blankRight.innerHTML = '&nbsp;'

			poemGrid.append(blankLeft, blankRight)
			continue
		}

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
	
	// Calculate content height and suggest optimal scale
	setTimeout(() => {
		const gridHeight = poemGrid.offsetHeight
		const titleHeight = poemTitle.style.display !== 'none' ? poemTitle.offsetHeight : 0
		const totalHeight = gridHeight + titleHeight
		const pageHeight = 10 * 96 // 10 inches at 96 DPI
		const heightInInches = (totalHeight / 96).toFixed(1)
		
		if (totalHeight > pageHeight) {
			const suggestedScale = Math.floor((pageHeight / totalHeight) * scale * 100)
			contentInfo.innerHTML = `
				<div>Height: ${heightInInches}"</div>
				<div style="color: #ff9999;">⚠️ Overflows page!</div>
				<div>Try scale: ${suggestedScale}%</div>
			`
		} else {
			const remainingSpace = ((pageHeight - totalHeight) / 96).toFixed(1)
			const maxScale = Math.floor((pageHeight / totalHeight) * scale * 100)
			contentInfo.innerHTML = `
				<div>Height: ${heightInInches}"</div>
				<div style="color: #99ff99;">✓ Fits on page</div>
				<div>Space left: ${remainingSpace}"</div>
				<div>Max scale: ${maxScale}%</div>
			`
		}
	}, 0)
}

// Main

poemInput.value = `If we didn’t have birthdays, you wouldn’t be you.
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

generatePrintable(poemInput.value)
