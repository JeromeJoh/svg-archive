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
  resultCount,
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
        if (window.scrollY === 0) return
        gsap.to(navRef.current, {
          backdropFilter: 'blur(12px)',
          duration: 0.3,
        })
        gsap.to('.decor-bottom', {
          scale: 1,
          duration: 0.3,
        })
      },

      onLeaveBack() {
        gsap.to(navRef.current, {
          duration: 0.3,
        })
        gsap.to('.decor-bottom', {
          scale: 0,
          duration: 0.3,
        })
      },
    })

    return () => trigger.kill()
  }, [])

  const emitSearch = useCallback(
    (value) => {
      clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange],
  )

  const handleInput = (value) => {
    setLocalSearch(value)
    emitSearch(value)
  }

  const clearSearch = () => {
    setLocalSearch('')
    onSearchChange('')

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  return (
    <nav
      ref={navRef}
      className="
      z-50
      backdrop-blur-md
      border-t
      border-width-1
      border-gray-700/30
      px-8
      py-6"
    >
      <div className="decor-bottom absolute bottom-0 left-0 right-0 h-[0.5px] bg-gray-700/30 scale-0"></div>
      <div className="flex flex-col gap-6">
        {/* input */}

        <div className="relative">
          <input
            ref={inputRef}
            value={localSearch}
            placeholder="search svg name or tag..."
            onInput={(e) => handleInput(e.target.value)}
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          />

          {localSearch && (
            <button
              onClick={clearSearch}
              className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-7
              h-7
              rounded-full
              bg-gray-700/70
              hover:bg-gray-600
              flex
              items-center
              justify-center"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            total
            <NumberFlowWrapper value={resultCount} />
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
              text-white

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
      toast.success(`${svg.name} copied to clipboard!`, { duration: 2000 })
    } catch (err) {
      console.error(err)
      toast.error(`Failed to copy ${svg.name}`, { duration: 2000 })
    }
  }

  return (
    <div
      onClick={copyToClipboard}
      className="
      cursor-pointer
        card
        relative
        w-64
        h-96
        text-white
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
        flex
        flex-col
        p-4
        shadow-2xl"
    >
      {/* 顶部标签（类似图片中的 Uncommon 挂件标签） */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1e2b4a] text-[#4ea2ff] text-xs font-bold px-6 py-1 rounded-b-xl border-b border-x border-blue-500/30 uppercase tracking-wider">
        {svg.name}
      </div>

      {/* SVG 内容容器（类似图片中 HAPE 的主图区域） */}
      <div
        className="
          h-72
          w-full
          border
          text-black
          border-zinc-800
          rounded-[18px]
          mt-6
          flex
          items-center
          justify-center
          p-6
          relative
          group"
        dangerouslySetInnerHTML={{
          __html: svg.content,
        }}
      />
    </div>
  )
}

/* --------------------------
Card Grid
--------------------------- */

function HeroSection() {
  const arrowRef = useRef()

  useEffect(() => {
    if (!arrowRef.current) return

    const tl = gsap.timeline({ repeat: -1 })

    tl.to(arrowRef.current, {
      y: 8,
      duration: 0.6,
      ease: 'sine.inOut',
    }).to(
      arrowRef.current,
      {
        y: 0,
        duration: 0.6,
        ease: 'sine.inOut',
      },
      0.6,
    )
  }, [])

  return (
    <div className="h-lvh flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1
          className="
          font-display
          text-4xl
          font-bold
          text-violet-500"
        >
          SVG Archive
        </h1>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-400">scroll</span>
          <svg
            ref={arrowRef}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <line x1="12" y1="2" x2="12" y2="18"></line>
            <polyline points="6 12 12 18 18 12"></polyline>
          </svg>
        </div>
      </div>
    </div>
  )
}

function CardGrid({ filteredSvgs }) {
  const containerRef = useRef()

  useEffect(() => {
    if (!containerRef.current || filteredSvgs.length < 8) return

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
      min-h-screen
      grid
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-4
      gap-8
      justify-items-center
      px-8
      pt-16
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
      <div className="text-slate-700">
        <HeroSection />

        <SearchNav
          onSearchChange={setSearchTerm}
          onTagsChange={handleTagClick}
          selectedTags={selectedTags}
          availableTags={availableTags}
          resultCount={filteredSvgs.length}
        />

        <CardGrid filteredSvgs={filteredSvgs} />

        <div className="h-dvh" />
      </div>
    </ScrollProvider>
  )
}
