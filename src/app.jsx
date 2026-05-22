import { useState, useEffect, useRef, useMemo } from 'preact/hooks'
import gsap from 'gsap'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import 'number-flow'

gsap.registerPlugin(ScrollTrigger)

const NumberFlowWrapper = ({ value }) => {
  const flowRef = useRef(null)

  useEffect(() => {
    if (!flowRef.current) return
    flowRef.current.update(value)
  }, [value])

  return (
    <number-flow ref={flowRef} className="text-xl font-bold text-blue-400" />
  )
}

const SvgItem = ({ svg, refCallback }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(svg.content)
      .then(() => console.log('copied'))
      .catch(console.error)
  }

  return (
    <div
      ref={refCallback}
      className="card relative
      w-[150px]
      h-[300px]
      bg-gray-900
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
        className="grow flex items-center justify-center"
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
            rounded
            text-xs
            bg-gray-700
            "
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
        text-sm
        "
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

  const cardsRef = useRef([])
  const containerRef = useRef(null)

  // 每次重新渲染列表前清空
  cardsRef.current = []

  const addToRefs = (el) => {
    if (el) cardsRef.current.push(el)
  }

  // SVG加载
  useEffect(() => {
    const loadSvgs = async () => {
      const modules = import.meta.glob('./assets/svgs/*.svg', {
        query: '?raw',
        import: 'default',
      })

      const loaded = []

      let id = 0

      for (const path in modules) {
        const content = await modules[path]()

        const name = path.split('/').pop()?.replace('.svg', '') || 'Unknown'

        loaded.push({
          id: id++,
          name,
          content,
          tags: [name, 'dynamic'],
        })
      }

      setAllSvgs(loaded)
      setDynamicSvgsCount(loaded.length)
    }

    loadSvgs()
  }, [])

  // 标签
  const availableTags = useMemo(() => {
    return Array.from(new Set(allSvgs.flatMap((svg) => svg.tags)))
  }, [allSvgs])

  // 筛选
  const filteredSvgs = useMemo(() => {
    return allSvgs.filter((svg) => {
      const matchesSearch =
        svg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svg.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => svg.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [allSvgs, searchTerm, selectedTags])

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    })

    // Lenis 滚动时通知 ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // 保存引用，否则 cleanup remove 不掉
    const update = (time) => {
      // GSAP ticker 时间单位是秒
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)

    // 避免 GSAP 自动补帧造成卡顿
    gsap.ticker.lagSmoothing(0)

    // 刷新 ScrollTrigger
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (!cardsRef.current.length) return

    ScrollTrigger.getAll().forEach((st) => st.kill())

    const ctx = gsap.context(() => {
      const columns = 4
      const middleColumn = Math.floor(columns / 2)
      const xIncrement = columns > 1 ? 400 / (columns - 1) : 0

      cardsRef.current.forEach((el, index) => {
        const column = index % columns

        gsap.set(el, {
          perspective: 1500,
        })

        let xPercent = 0

        if (column === 0) xPercent = -200
        else if (column === middleColumn) xPercent = 0
        else if (column === columns - 1) xPercent = 200
        else {
          xPercent = -200 + column * xIncrement
        }

        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'center center',
              scrub: true,
            },
          })
          .fromTo(
            el,
            {
              rotationX: -25 * (column + 1),
              z: 30 * (column + 1),
              yPercent: 30,
              xPercent,
            },
            {
              rotationX: 0,
              z: 0,
              yPercent: 0,
              xPercent: 0,
              transformOrigin: '50% 100%',
            },
          )
      })

      ScrollTrigger.refresh()
    }, containerRef)

    return () => ctx.revert()
  }, [filteredSvgs])

  return (
    <div
      className="
      p-8
      bg-gray-900
      min-h-screen
      text-white"
    >
      <h1
        className="
        text-center
        text-4xl
        mb-6
        font-bold
        "
      >
        SVG Archive
      </h1>

      <div className="mb-6">
        <input
          className="
          w-full
          p-3
          rounded
          bg-gray-800
          "
          placeholder="搜索..."
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
        />

        <div className="mt-3 flex items-center gap-2">
          SVG数量:
          <NumberFlowWrapper value={dynamicSvgsCount} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`
              px-3
              py-2
              rounded
              ${selectedTags.includes(tag) ? 'bg-blue-600' : 'bg-gray-700'}
            `}
          >
            {tag}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="
        w-full
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-8
        justify-items-center
        "
      >
        {Array.from({ length: 6 }, () => filteredSvgs)
          .flat()
          .map((svg, index) => (
            <SvgItem key={index} svg={svg} refCallback={addToRefs} />
          ))}
      </div>
      <div className="h-dvh"></div>
    </div>
  )
}
