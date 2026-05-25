import { useState, useEffect, useMemo, useRef, useCallback } from 'preact/hooks'

import gsap from 'gsap'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import 'number-flow'

gsap.registerPlugin(ScrollTrigger)

/* --------------------------
Scroll Provider
--------------------------- */

function ScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const update = (time) => {
      // gsap ticker 时间单位已经是秒
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  return children
}

/* --------------------------
Number Flow
--------------------------- */

function NumberFlowWrapper({ value }) {
  const flowRef = useRef()

  useEffect(() => {
    flowRef.current?.update(value)
  }, [value])

  return (
    <number-flow
      ref={flowRef}
      value={value}
      className="text-xl font-bold text-blue-400"
    />
  )
}

/* --------------------------
Search Nav
--------------------------- */

function SearchNav({
  onSearchChange,
  onTagsChange,
  selectedTags,
  availableTags,
  dynamicSvgsCount,
}) {
  const inputRef = useRef()
  const navRef = useRef()

  const [localSearch, setLocalSearch] = useState('')
  const debounceRef = useRef()

  useEffect(() => {
    inputRef.current?.focus()

    return () => {
      clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    if (!navRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: navRef.current,
      pin: true,
      pinSpacing: false,
      start: 'top top',
      end: 'max',

      onEnter() {
        gsap.to(navRef.current, {
          boxShadow: '0 4px 12px rgba(0,0,0,.5)',

          backdropFilter: 'blur(12px)',

          duration: 0.3,
        })
      },

      onLeaveBack() {
        gsap.to(navRef.current, {
          boxShadow: 'none',
          duration: 0.3,
        })
      },
    })

    return () => trigger.kill()
  }, [])

  const handleInput = (value) => {
    setLocalSearch(value)

    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      onSearchChange(value)
    }, 300)
  }

  return (
    <nav
      ref={navRef}
      className="
      z-50
      backdrop-blur-md
      bg-gray-900/80
      border-b
      border-gray-700/50
      px-8
      py-6"
    >
      <div className="flex flex-col gap-6">
        <input
          ref={inputRef}
          value={localSearch}
          placeholder="搜索..."
          onInput={(e) => handleInput(e.target.value)}
          className="
          w-full
          p-3
          rounded
          bg-gray-800/60
          border
          border-gray-700/50
          focus:outline-none
          focus:border-gray-500"
        />

        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            SVG数量:
            <NumberFlowWrapper value={dynamicSvgsCount} />
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagsChange(tag)}
                className={`
                    px-3
                    py-2
                    rounded
                    transition-colors
                    ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }
                  `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

/* --------------------------
SVG Item
--------------------------- */

function SvgItem({ svg }) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(svg.content)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      className="
      card
      relative
      w-35
      h-75
      border-2
      border-gray-700
      rounded-xl
      overflow-hidden
      flex
      flex-col
      p-3
      shadow-lg"
    >
      <div
        className="
        grow
        flex
        items-center
        justify-center"
        dangerouslySetInnerHTML={{
          __html: svg.content,
        }}
      />

      <h3 className="text-blue-400 text-sm font-semibold mt-2">{svg.name}</h3>

      <div className="flex gap-1 flex-wrap my-2">
        {svg.tags.map((tag) => (
          <span
            key={tag}
            className="
              px-2
              py-1
              text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={copyToClipboard}
        className="
        bg-blue-600
        hover:bg-blue-700
        rounded
        p-2
        text-sm"
      >
        Copy SVG
      </button>
    </div>
  )
}

/* --------------------------
Card Grid
--------------------------- */

function CardGrid({ filteredSvgs }) {
  const containerRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.card')

      cards.forEach((el, index) => {
        const column = index % 4

        let xPercent = 0

        switch (column) {
          case 0:
            xPercent = -200
            break

          case 1:
            xPercent = -70
            break

          case 2:
            xPercent = 70
            break

          case 3:
            xPercent = 200
            break
        }

        gsap.fromTo(
          el,
          {
            rotationX: -25,
            yPercent: 30,
            xPercent,
          },
          {
            rotationX: 0,
            yPercent: 0,
            xPercent: 0,

            ease: 'none',

            scrollTrigger: {
              trigger: el,

              start: 'top bottom',

              end: 'center center',

              scrub: true,
            },
          },
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [filteredSvgs])

  return (
    <div
      ref={containerRef}
      className="
      grid
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-4
      gap-8
      justify-items-center
      px-8
      pt-8
      pb-8"
    >
      {filteredSvgs.map((svg) => (
        <SvgItem key={svg.id} svg={svg} />
      ))}
    </div>
  )
}

/* --------------------------
APP
--------------------------- */

export function App() {
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedTags, setSelectedTags] = useState([])

  const [allSvgs, setAllSvgs] = useState([])

  /* SVG load */

  useEffect(() => {
    const loadSvgs = async () => {
      const modules = import.meta.glob('./assets/svgs/*.svg', {
        query: '?raw',

        import: 'default',
      })

      const loaded = await Promise.all(
        Object.entries(modules).map(async ([path, importer], index) => {
          const content = await importer()

          const name = path.split('/').pop()?.replace('.svg', '')

          return {
            id: index,
            name,
            content,
            tags: [name, 'dynamic'],
          }
        }),
      )

      setAllSvgs(loaded)
    }

    loadSvgs()
  }, [])

  const availableTags = useMemo(() => {
    return [...new Set(allSvgs.flatMap((svg) => svg.tags))]
  }, [allSvgs])

  const filteredSvgs = useMemo(() => {
    return allSvgs.filter((svg) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        svg.name.toLowerCase().includes(search) ||
        svg.tags.some((tag) => tag.toLowerCase().includes(search))

      const matchesTags =
        !selectedTags.length ||
        selectedTags.every((tag) => svg.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [allSvgs, searchTerm, selectedTags])

  const handleTagClick = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }, [])

  return (
    <ScrollProvider>
      <div className="text-white">
        <div className="h-lvh flex items-center justify-center">
          <h1
            className="
            text-4xl
            font-bold
            text-violet-500"
          >
            SVG Archive
          </h1>
        </div>

        <SearchNav
          onSearchChange={setSearchTerm}
          onTagsChange={handleTagClick}
          selectedTags={selectedTags}
          availableTags={availableTags}
          dynamicSvgsCount={allSvgs.length}
        />

        <CardGrid filteredSvgs={filteredSvgs} />

        <div className="h-dvh" />
      </div>
    </ScrollProvider>
  )
}
