import './style.css'

const poemInput = document.querySelector<HTMLTextAreaElement>('#poemInput')!
const poemForm = document.querySelector<HTMLFormElement>('#poemForm')!
const printable = document.querySelector<HTMLDivElement>('#printable')!
const poemGrid = document.querySelector<HTMLDivElement>('#poemGrid')!

function wrapLine(line: string, maxLen = 50): string[] {
	const words = line.trim().split(/\s+/)
	let current = ''
	const lines: string[] = []

	for (const word of words) {
		if ((current + word).length > maxLen) {
			lines.push(current.trim())
			current = word + ' '
		} else {
			current += word + ' '
		}
	}

	if (current.trim()) lines.push(current.trim())
	return lines
}

function generatePrintable(poem: string) {
	poemGrid.innerHTML = ''
	const lines = poem.split('\n')

	for (const line of lines) {
		if (line.trim() === '') {
			const blankLeft = document.createElement('div')
			blankLeft.className = 'poemLine poemText'
			blankLeft.innerHTML = '&nbsp;'

			const blankRight = document.createElement('div')
			blankRight.className = 'poemLine hintText'
			blankRight.innerHTML = '&nbsp;'

			poemGrid.append(blankLeft, blankRight)
			continue
		}

		const wraps = wrapLine(line)
		for (const subline of wraps) {
			const words = subline.trim().split(/\s+/)

			const left = document.createElement('div')
			left.className = 'poemLine poemText'
			left.textContent = subline

			const right = document.createElement('div')
			right.className = 'poemLine hintText'
			right.textContent = words.map(w => w[0] ?? '').join(' ')

			poemGrid.append(left, right)
		}
	}

	printable.style.display = 'block'
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

poemForm.addEventListener('submit', (e: SubmitEvent) => {
	e.preventDefault()
	const poemText: string = poemInput.value.trim()
	generatePrintable(poemText)
})

poemInput.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key === 'Enter' && e.ctrlKey) {
		e.preventDefault()
		poemForm.requestSubmit()
	}
})
