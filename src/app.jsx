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
      bg-gray-900/80
      border-b
      border-gray-700/50
      px-8
      py-6"
    >
      <div className="flex flex-col gap-6">
        {/* input */}

        <div className="relative">
          <input
            ref={inputRef}
            value={localSearch}
            placeholder="搜索..."
            onInput={(e) => handleInput(e.target.value)}
            className="
            w-full
            p-3
            pr-12
            rounded
            bg-gray-800/60
            border
            border-gray-700/50
            focus:outline-none
            focus:border-gray-500"
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
            筛选结果:
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
        w-72
        bg-[#111315]
        text-white
        border
        border-zinc-800
        rounded-[24px]
        overflow-hidden
        flex
        flex-col
        p-4
        shadow-2xl"
    >
      {/* 顶部标签（类似图片中的 Uncommon 挂件标签） */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1e2b4a] text-[#4ea2ff] text-xs font-bold px-6 py-1 rounded-b-xl border-b border-x border-blue-500/30 uppercase tracking-wider">
        SVG Preview
      </div>

      {/* SVG 内容容器（类似图片中 HAPE 的主图区域） */}
      <div
        className="
          grow
          aspect-square
          w-full
          bg-[#17191c]
          border
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

      {/* 标题（类似 HAPE #67） */}
      <h3 className="text-xl font-bold mt-4 tracking-wide text-zinc-100">
        {svg.name}
      </h3>

      {/* 副标题/作者（类似 HAPE PRIME） */}
      <div className="text-xs text-zinc-500 font-medium mt-1 mb-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block"></span>
        VECTOR ASSET
      </div>

      {/* 数据/标签展示区（类比底部的 Avg earnings / Distribution） */}
      <div className="bg-[#17191c] rounded-xl p-3 flex flex-col gap-2 border border-zinc-800/50 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-400">Tags</span>
          <span className="text-xs text-zinc-500">{svg.tags.length} items</span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {svg.tags.map((tag) => (
            <span
              key={tag}
              className="
                px-2.5
                py-1
                bg-zinc-800/60
                text-zinc-300
                rounded-md
                text-[11px]
                font-medium
                border
                border-zinc-700/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 操作按钮（类似购买/出价按钮的显眼样式） */}
      <button
        onClick={copyToClipboard}
        className="
          w-full
          bg-[#00e676]
          hover:bg-[#00c853]
          active:scale-[0.98]
          text-black
          font-bold
          rounded-xl
          py-3
          text-sm
          transition-all
          duration-200
          shadow-[0_0_20px_rgba(0,230,118,0.15)]"
      >
        Copy SVG Code
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
          resultCount={filteredSvgs.length}
        />

        <CardGrid filteredSvgs={filteredSvgs} />

        <div className="h-dvh" />
      </div>
    </ScrollProvider>
  )
}
