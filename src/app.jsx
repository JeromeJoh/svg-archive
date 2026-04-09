import { useState, useEffect } from 'preact/hooks'

// Mock SVG data
const initialSvgs = [
  {
    id: '1',
    name: 'Home Icon',
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    tags: ['home', 'house', 'navigation'],
  },
  {
    id: '2',
    name: 'Settings Icon',
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.35a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.74v.44a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.35a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 1-1.74v.44a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.35a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.44a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-1-1.74V2a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    tags: ['settings', 'gear', 'configuration'],
  },
  {
    id: '3',
    name: 'User Icon',
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    tags: ['user', 'profile', 'account'],
  },
]

const SvgItem = ({ svg }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(svg.content)
      .then(() => alert('SVG copied to clipboard!'))
      .catch((err) => console.error('Failed to copy SVG: ', err))
  }

  return (
    <div
      className="relative border-2 border-white rounded-lg p-4 text-center bg-black shadow-lg overflow-hidden"
      style={{
        width: '150px',
        height: '300px',
        borderRadius: '20px',
        borderBottomLeftRadius: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      {/* Top right corner arc - using pseudo-elements or a div for styling */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400 transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>

      {/* Content area for SVG */}
      <div
        className="my-3 flex justify-center items-center flex-grow"
        dangerouslySetInnerHTML={{ __html: svg.content }}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      <h3 className="mt-auto text-blue-300 text-lg font-semibold">
        {svg.name}
      </h3>

      <div className="mb-3 flex flex-wrap justify-center gap-1">
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

      {/* Bottom left corner arc - using pseudo-elements or a div for styling */}
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400 transform -rotate-45 -translate-x-1/2 translate-y-1/2"></div>
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
      const modules = import.meta.glob('./assets/svgs/*.svg', { as: 'raw' })
      const dynamicSvgs = []
      let idCounter = initialSvgs.length + 1

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
      setAllSvgs([...initialSvgs, ...dynamicSvgs])
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
      <h1 className="text-center text-3xl font-bold mb-5 text-blue-400">
        SVG Archive - Sci-Fi Style Showcase
      </h1>
      <div className="mb-5">
        <input
          type="text"
          placeholder="搜索 SVG..."
          className="p-2 border border-gray-700 rounded-md w-full bg-gray-800 text-white placeholder-gray-500"
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
        />
        <p className="text-sm text-gray-500 mt-2">
          动态加载的 SVG 数量: {dynamicSvgsCount}
        </p>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center">
        {filteredSvgs.map((svg) => (
          <SvgItem key={svg.id} svg={svg} />
        ))}
      </div>
    </div>
  )
}
