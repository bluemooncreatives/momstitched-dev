'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import PageContentEditor from '@/components/Application/Admin/page-content/PageContentEditor'
import { ImageField, ListField } from '@/components/Application/Admin/page-content/PageFields'
import { AreaField, FieldGroup, SwitchField, TextField } from '@/components/Application/Admin/page-content/FormFields'
import { ABOUT_PAGE_KEY, ABOUT_PAGE_LIMITS as L, ABOUT_PAGE_TEMPLATES, DEFAULT_ABOUT_PAGE } from '@/lib/pageContent/aboutPage'
import { aboutPageSchema } from '@/lib/pageContent/schema'
import { ADMIN_BESTSELLER_SHOW, ADMIN_DASHBOARD, ADMIN_PAGES_ABOUT } from '@/routes/AdminPanelRoute'

const breadcrumb = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_PAGES_ABOUT, label: 'About Us page' },
]

const D = DEFAULT_ABOUT_PAGE
const item = (path) => () => structuredClone(ABOUT_PAGE_TEMPLATES[path])
const LINK_HINT = 'A storefront path like /contact, or a full https:// link.'
const PARAGRAPH_HINT = 'Leave a blank line between paragraphs.'

const SectionSwitch = ({ name, label, description }) => {
    const { control } = useFormContext()
    const enabled = useWatch({ control, name })
    return (
        <>
            <SwitchField control={control} name={name} label={label} description={description} />
            {enabled === false && (
                <p className="admin-tone--warn rounded-md border px-3 py-2 text-xs">Hidden from the page. Everything below is kept for when you switch it back on.</p>
            )}
        </>
    )
}

const HeroFields = () => {
    const { control } = useFormContext()
    return (
        <>
            <FieldGroup title="Hero" description="The giant headline with the plus-marker caption beneath it.">
                <TextField control={control} name="hero.headline" label="Headline" maxLength={30} hint="Shown very large, in lower case as typed." />
                <AreaField control={control} name="hero.caption" label="Caption" maxLength={120} rows={2} hint="Beside the + marker. A line break starts a new line." />
            </FieldGroup>
            <FieldGroup title="Hero photos" description="A tall centre photo with two small photos either side that drift as the page scrolls.">
                <ImageField name="hero.centre" label="Centre photo" defaultImage={D.hero.centre} />
                <ImageField name="hero.left" label="Left photo" defaultImage={D.hero.left} />
                <ImageField name="hero.right" label="Right photo" defaultImage={D.hero.right} />
            </FieldGroup>
        </>
    )
}

const StoryFields = () => {
    const { control } = useFormContext()
    return (
        <>
            <FieldGroup title="Statement & story" description="A large statement, then the brand story in paragraphs.">
                <SectionSwitch name="story.enabled" label="Show the statement and story" />
                <AreaField control={control} name="story.statement" label="Statement" maxLength={200} rows={3} />
                <AreaField control={control} name="story.body" label="Story" maxLength={2400} rows={10} hint={PARAGRAPH_HINT} />
            </FieldGroup>
            <FieldGroup title="Full-width photo" description="The wide photo between the story and the family. It zooms gently as the page scrolls.">
                <SectionSwitch name="feature.enabled" label="Show the full-width photo" />
                <ImageField name="feature.image" label="Photo" defaultImage={D.feature.image} />
            </FieldGroup>
        </>
    )
}

const FamilyFields = () => {
    const { control } = useFormContext()
    return (
        <>
            <FieldGroup title="The family" description="The section heading and introduction, then one profile per person. Profiles alternate photo left and right.">
                <SectionSwitch name="family.enabled" label="Show the family section" />
                <TextField control={control} name="family.eyebrow" label="Label" maxLength={40} />
                <AreaField control={control} name="family.title" label="Headline" maxLength={120} rows={2} />
                <AreaField control={control} name="family.intro" label="Introduction" maxLength={400} rows={4} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <TextField control={control} name="family.ctaLabel" label="Button text" maxLength={30} hint="Leave empty to hide the button." />
                    <TextField control={control} name="family.ctaHref" label="Button link" hint={LINK_HINT} />
                </div>
            </FieldGroup>
            <FieldGroup title="People">
                <ListField
                    name="family.people"
                    label="People"
                    noun="person"
                    max={L.people}
                    newItem={item('family.people')}
                    itemTitle={(value) => value.name}
                    renderItem={(prefix) => (
                        <>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <TextField control={control} name={`${prefix}.name`} label="Name" maxLength={60} />
                                <TextField control={control} name={`${prefix}.role`} label="Role" maxLength={80} />
                            </div>
                            <AreaField control={control} name={`${prefix}.bio`} label="Bio" maxLength={1600} rows={8} hint={PARAGRAPH_HINT} />
                            <ImageField name={`${prefix}.photo`} label="Portrait" autoNote="None: their initials show instead." />
                        </>
                    )}
                />
            </FieldGroup>
        </>
    )
}

const RelatedFields = () => {
    const { control } = useFormContext()
    return (
        <FieldGroup
            title="You may also like"
            description={<>Four random picks from the <a className="underline underline-offset-2" href={ADMIN_BESTSELLER_SHOW}>Bestsellers</a> at the end of the page. The section hides while there are none.</>}
        >
            <SectionSwitch name="related.enabled" label="Show product picks" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField control={control} name="related.eyebrow" label="Label" maxLength={40} />
                <TextField control={control} name="related.title" label="Headline" maxLength={60} />
            </div>
        </FieldGroup>
    )
}

const SECTIONS = [
    { value: 'hero', label: 'Hero', keys: ['hero'], content: <HeroFields /> },
    { value: 'story', label: 'Story & photo', keys: ['story', 'feature'], content: <StoryFields /> },
    { value: 'family', label: 'Family', keys: ['family'], content: <FamilyFields /> },
    { value: 'related', label: 'Product picks', keys: ['related'], content: <RelatedFields /> },
]

const AboutPageEditor = () => (
    <PageContentEditor
        pageKey={ABOUT_PAGE_KEY}
        title="About Us page"
        description="The copy, photos and family profiles of /about-us. Changes go live when you publish."
        viewHref="/about-us"
        breadcrumb={breadcrumb}
        schema={aboutPageSchema}
        defaults={DEFAULT_ABOUT_PAGE}
        sections={SECTIONS}
    />
)

export default AboutPageEditor
