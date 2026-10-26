// Server-rendered schema.org block. `<` is escaped so a product name or FAQ
// answer containing "</script>" can't break out of the tag.
const JsonLd = ({ data }) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
)

export default JsonLd
