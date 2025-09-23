function cutNonstanzaNewlines(text: string): string {
	// Split on double newlines to find stanzas
	const stanzas = text.split(/\n\s*\n/)

	// Process each stanza: remove single newlines within it
	const processedStanzas = stanzas.map(stanza => {
		// Replace single newlines with spaces within the stanza
		return stanza.replace(/\n/g, ' ')
	})

	// Join stanzas back with double newlines
	return processedStanzas.join('\n\n')
}

function runTest(name: string, input: string, expected: string): void {
	const result = cutNonstanzaNewlines(input)
	if (result === expected) {
		console.log(`✅ ${name}: PASSED`)
	} else {
		console.log(`❌ ${name}: FAILED`)
		console.log('Input:')
		console.log(JSON.stringify(input))
		console.log('\nExpected:')
		console.log(JSON.stringify(expected))
		console.log('\nActual:')
		console.log(JSON.stringify(result))
		console.log('---')
	}
}

// Test case from user
const input1 = `No, no, no, it ain't me, babe

It ain't me you're lookin' for, babe


Go lightly from the ledge, babe

Go lightly on the ground`

const expected1 = `No, no, no, it ain't me, babe
It ain't me you're lookin' for, babe

Go lightly from the ledge, babe
Go lightly on the ground`

runTest('User example - Dylan lyrics', input1, expected1)

// Additional test cases
const input2 = `Line 1
Line 2

Stanza 2 Line 1
Stanza 2 Line 2`

const expected2 = `Line 1 Line 2

Stanza 2 Line 1 Stanza 2 Line 2`

runTest('Simple two stanza poem', input2, expected2)

// Test with triple newlines
const input3 = `First line
Second line


New stanza here`

const expected3 = `First line Second line

New stanza here`

runTest('Triple newlines between stanzas', input3, expected3)

// Test single stanza
const input4 = `Just one line
And another line
And a third line`

const expected4 = `Just one line And another line And a third line`

runTest('Single stanza with multiple lines', input4, expected4)