import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'

const poemInput = document.querySelector<HTMLTextAreaElement>('#poemInput')!
const poemForm = document.querySelector<HTMLFormElement>('#poemForm')!
const printable = document.querySelector<HTMLDivElement>('#printable')!
const poemGrid = document.querySelector<HTMLDivElement>('#poemGrid')!


function generatePrintable(poem: string) {
  poemGrid.innerHTML = '' // clear previous

  const lines = poem.split('\n')

  for (const line of lines) {
    const words = line.trim().split(/\s+/)

    // create left cell with full line text
    const left = document.createElement('div')
    left.className = 'poemLine poemText'
    left.textContent = line

    // create right cell with first letters spaced
    const right = document.createElement('div')
    right.className = 'poemLine hintText'
    right.textContent = words.map(w => w[0] ?? '').join(' ')

    poemGrid.append(left, right)
  }

  printable.style.display = 'block'
}

// Main

poemInput.value = `Banish wisdom, discard knowledge
and the people shall profit a hundredfold;
banish humanity, discard justice
and the people shall recover love of their kin
banish cunning, discard utility
and the thieves and brigands shall disappear
as these three touch the externals and are inadequate
the people have need of what they can depend upon:
Reveal thy simple self`

poemForm.addEventListener('submit', (e: SubmitEvent) => {
	e.preventDefault()
	const poemText: string = poemInput.value.trim()
	console.log('submitted poem:', poemText)
	generatePrintable(poemText)

	// TODO: generate printable poem + hint view here
})

poemInput.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key === 'Enter' && e.ctrlKey) {
		e.preventDefault()
		poemForm.requestSubmit() // triggers form submit event
	}
})

