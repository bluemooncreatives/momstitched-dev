import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_ABOUT_PAGE, mergeAboutPage } from '../lib/pageContent/aboutPage.js'
import { aboutPageSchema, firstIssue } from '../lib/pageContent/schema.js'
import { EMPTY_IMAGE, collectImages, paragraphs } from '../lib/pageContent/shared.js'

const withChange = (change) => {
    const content = structuredClone(DEFAULT_ABOUT_PAGE)
    change(content)
    return aboutPageSchema.safeParse(content)
}

test('the designed defaults are valid content', () => {
    assert.equal(aboutPageSchema.safeParse(DEFAULT_ABOUT_PAGE).success, true)
})

test('merge keeps known keys, ignores wrong types and fills new list items', () => {
    const merged = mergeAboutPage({
        hero: { headline: 42, caption: 'Hello' },
        family: { people: [{ name: 'Asha' }, 'not an object'] },
        unknown: { injected: true },
    })
    assert.equal(merged.hero.headline, DEFAULT_ABOUT_PAGE.hero.headline)
    assert.equal(merged.hero.caption, 'Hello')
    assert.deepEqual(merged.family.people, [{ name: 'Asha', role: '', bio: '', photo: EMPTY_IMAGE }])
    assert.equal('unknown' in merged, false)
    assert.equal(mergeAboutPage(null).hero.headline, DEFAULT_ABOUT_PAGE.hero.headline)
})

test('merging never hands out the defaults themselves', () => {
    const merged = mergeAboutPage(null)
    merged.family.people.push({ name: 'Edited' })
    assert.equal(DEFAULT_ABOUT_PAGE.family.people.length, 2)
})

test('a picked photo needs alt text and a Cloudinary or storefront URL', () => {
    const noAlt = withChange((c) => { c.hero.centre.alt = '' })
    assert.equal(noAlt.success, false)
    assert.match(firstIssue(noAlt.error), /^hero › centre › alt:/)
    assert.equal(withChange((c) => { c.hero.centre.url = 'https://example.com/a.jpg' }).success, false)
    assert.equal(withChange((c) => { c.hero.centre = { ...EMPTY_IMAGE } }).success, true)
    assert.equal(withChange((c) => { c.hero.centre.mediaId = 'not-an-id' }).success, false)
})

test('button links must be storefront paths or https', () => {
    assert.equal(withChange((c) => { c.family.ctaHref = '/contact' }).success, true)
    assert.equal(withChange((c) => { c.family.ctaHref = 'https://wa.me/910000000000' }).success, true)
    for (const href of ['javascript:alert(1)', '//evil.example', 'http://insecure.example']) {
        assert.equal(withChange((c) => { c.family.ctaHref = href }).success, false, href)
    }
})

test('required copy and list limits are enforced', () => {
    assert.equal(withChange((c) => { c.hero.headline = '  ' }).success, false)
    assert.equal(withChange((c) => { c.family.people = Array.from({ length: 7 }, () => c.family.people[0]) }).success, false)
})

test('helpers: paragraphs split on blank lines, images are collected from lists', () => {
    assert.deepEqual(paragraphs('One\nline\n\n  Two  \n\n\n'), ['One line', 'Two'])
    assert.equal(collectImages(DEFAULT_ABOUT_PAGE).length, 6)
})
