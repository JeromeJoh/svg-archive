import { useState, useEffect } from 'preact/hooks'

const SvgItem = ({ svg }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(svg.content)
      .then(() => alert('SVG copied to clipboard!'))
      .catch((err) => console.error('Failed to copy SVG: ', err))
  }

  const decorativeSvg = `
    <svg width="100%" height="100%" viewBox="0 0 150 300" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0">
        <path d="M0 260C0 279.882 16.1177 296 36 296H146V0H0V260Z" fill="none" stroke="#4A5568" stroke-width="2"/>
        <path d="M0 260C0 279.882 16.1177 296 36 296" stroke="white" stroke-width="2"/>
        <circle cx="36" cy="260" r="18" stroke="white" stroke-width="2"/>
        <circle cx="36" cy="260" r="8" stroke="white" stroke-width="2"/>
        <circle cx="36" cy="260" r="3" fill="white"/>
        <line x1="36" y1="242" x2="36" y2="278" stroke="white" stroke-width="1"/>
        <line x1="18" y1="260" x2="54" y2="260" stroke="white" stroke-width="1"/>
        <path d="M36 260L25 245" stroke="white" stroke-width="1"/>
        <path d="M36 260L47 245" stroke="white" stroke-width="1"/>
        <path d="M36 260L25 275" stroke="white" stroke-width="1"/>
        <path d="M36 260L47 275" stroke="white" stroke-width="1"/>
        <circle cx="65" cy="225" r="12" stroke="white" stroke-width="1"/>
        <circle cx="65" cy="225" r="6" fill="white"/>
        <path d="M36 260L65 225" stroke="white" stroke-width="1"/>
        <circle cx="25" cy="245" r="4" fill="white"/>
        <circle cx="47" cy="245" r="4" fill="white"/>
        <circle cx="25" cy="275" r="4" fill="white"/>
        <circle cx="47" cy="275" r="4" fill="white"/>
        <circle cx="80" cy="250" r="10" stroke="white" stroke-width="1"/>
        <path d="M65 225L80 250" stroke="white" stroke-width="1"/>
        <circle cx="70" cy="280" r="8" stroke="white" stroke-width="1"/>
        <path d="M36 260L70 280" stroke="white" stroke-width="1"/>
        <circle cx="95" cy="210" r="6" fill="white"/>
        <path d="M80 250L95 210" stroke="white" stroke-width="1"/>
    </svg>
  `

  return (
    <div
      className="relative w-[150px] h-[300px] bg-gray-900 border-2 border-gray-700 overflow-hidden"
      style={{
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderBottomRightRadius: '0',
        borderBottomLeftRadius: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        dangerouslySetInnerHTML={{ __html: decorativeSvg }}
      />

      {/* Content area for SVG */}
      <div
        className="flex justify-center items-center grow p-4"
        dangerouslySetInnerHTML={{ __html: svg.content }}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      <h3 className="text-blue-400 text-lg font-semibold mt-auto mb-2">
        {svg.name}
      </h3>

      <div className="flex flex-wrap justify-center gap-1 mb-4">
        {svg.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-700 rounded-md px-2 py-1 text-xs text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={copyToClipboard}
        className="bg-blue-600 text-white border-none rounded-md px-3 py-2 cursor-pointer transition-colors duration-300 hover:bg-blue-700"
      >
        Copy SVG
      </button>
    </div>
  )
}

export function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [allSvgs, setAllSvgs] = useState([])
  const [dynamicSvgsCount, setDynamicSvgsCount] = useState(0)

  useEffect(() => {
    const loadSvgs = async () => {
      const modules = import.meta.glob('./assets/svgs/*.svg', {
        query: '?raw',
        import: 'default',
      })
      const dynamicSvgs = []
      let idCounter = 1

      for (const path in modules) {
        const getContent = modules[path]
        const content = await getContent()
        const name = path.split('/').pop()?.replace('.svg', '') || 'Unknown'
        dynamicSvgs.push({
          id: String(idCounter++),
          name: name.charAt(0).toUpperCase() + name.slice(1) + ' Icon',
          content,
          tags: [name, 'dynamic'],
        })
      }
      setDynamicSvgsCount(dynamicSvgs.length)
      setAllSvgs(dynamicSvgs)
    }
    loadSvgs()
  }, [])

  const availableTags = Array.from(new Set(allSvgs.flatMap((svg) => svg.tags)))

  const filteredSvgs = allSvgs.filter((svg) => {
    const matchesSearchTerm =
      svg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svg.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((selectedTag) => svg.tags.includes(selectedTag))
    return matchesSearchTerm && matchesTags
  })

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div className="p-5 max-w-4xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-8 text-blue-400">
        SVG Archive - Sci-Fi Style Showcase
      </h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="搜索 SVG..."
          className="p-3 border border-gray-700 rounded-md w-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
        />
        <p className="text-sm text-gray-500 mt-2">
          动态加载的 SVG 数量: {dynamicSvgsCount}
        </p>
      </div>
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {availableTags.map((tag) => (
          <button
            key={tag}
            className={`bg-gray-700 border border-gray-600 rounded-full px-4 py-2 cursor-pointer transition-colors duration-300 ${selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'hover:bg-gray-600'}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
        {filteredSvgs.map((svg) => (
          <SvgItem key={svg.id} svg={svg} />
        ))}
      </div>
    </div>
  )
}
