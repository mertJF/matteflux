// Matteflux video background for Framer — v1.0
//
// Setup (about 2 minutes):
// 1. In Framer: Assets > Code > "+" > New component. Name it MattefluxBackground.
// 2. Replace the file contents with this file and save.
// 3. Drag the component into your hero or footer frame, set it to fill the
//    frame (Position: Absolute, all edges 0) and send it to the back.
// 4. In the right panel, upload the files from the Matteflux ZIP:
//    desktop + mobile MP4/WebM from /hero or /footer, and the posters.
// 5. Set Overlay to the value from the README (hero 0.2, footer 0.35).

import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState } from "react"

type Props = {
    desktopWebm: string
    desktopMp4: string
    mobileWebm: string
    mobileMp4: string
    desktopPoster: string
    mobilePoster: string
    breakpoint: number
    overlay: number
    lazy: boolean
    position: string
    style?: React.CSSProperties
}

function useMedia(query: string) {
    const [match, setMatch] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(query)
        const update = () => setMatch(mq.matches)
        update()
        mq.addEventListener?.("change", update)
        return () => mq.removeEventListener?.("change", update)
    }, [query])
    return match
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function MattefluxBackground(props: Props) {
    const {
        desktopWebm, desktopMp4, mobileWebm, mobileMp4,
        desktopPoster, mobilePoster, breakpoint, overlay, lazy, position,
    } = props

    const root = useRef<HTMLDivElement>(null)
    const video = useRef<HTMLVideoElement>(null)
    const isMobile = useMedia(`(max-width: ${breakpoint}px)`)
    const reduceMotion = useMedia("(prefers-reduced-motion: reduce)")
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const [near, setNear] = useState(!lazy)
    const [playing, setPlaying] = useState(false)

    const webm = isMobile && (mobileWebm || mobileMp4) ? mobileWebm : desktopWebm
    const mp4 = isMobile && (mobileWebm || mobileMp4) ? mobileMp4 : desktopMp4
    const poster = isMobile && mobilePoster ? mobilePoster : desktopPoster
    const showVideo = !reduceMotion && near && (webm || mp4)

    // Load when close to the viewport; pause while off screen.
    useEffect(() => {
        const el = root.current
        if (!el || typeof IntersectionObserver === "undefined") {
            setNear(true)
            return
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setNear(true)
                    video.current?.play().catch(() => {})
                } else {
                    video.current?.pause()
                }
            },
            { rootMargin: "300px 0px" }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    // Reload when the composition changes (desktop <-> mobile).
    useEffect(() => {
        const v = video.current
        if (!v) return
        setPlaying(false)
        v.load()
        if (!onCanvas) v.play().catch(() => {})
    }, [webm, mp4, showVideo, onCanvas])

    const fill: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: position,
    }

    return (
        <div
            ref={root}
            aria-hidden="true"
            style={{
                ...props.style,
                position: "relative",
                overflow: "hidden",
                background: "#0A0B0E",
                pointerEvents: "none",
            }}
        >
            {poster && <img src={poster} alt="" style={fill} decoding="async" />}
            {showVideo && (
                <video
                    ref={video}
                    muted
                    loop
                    playsInline
                    autoPlay={!onCanvas}
                    preload={lazy ? "none" : "auto"}
                    onPlaying={() => setPlaying(true)}
                    style={{ ...fill, opacity: playing ? 1 : 0, transition: "opacity 0.6s ease" }}
                >
                    {webm && <source src={webm} type="video/webm" />}
                    {mp4 && <source src={mp4} type="video/mp4" />}
                </video>
            )}
            <div style={{ position: "absolute", inset: 0, background: `rgba(8, 8, 9, ${overlay})` }} />
        </div>
    )
}

MattefluxBackground.defaultProps = {
    breakpoint: 767,
    overlay: 0.2,
    lazy: false,
    position: "50% 50%",
}

addPropertyControls(MattefluxBackground, {
    desktopWebm: { type: ControlType.File, title: "Desktop WebM", allowedFileTypes: ["webm"] },
    desktopMp4: { type: ControlType.File, title: "Desktop MP4", allowedFileTypes: ["mp4"] },
    mobileWebm: { type: ControlType.File, title: "Mobile WebM", allowedFileTypes: ["webm"] },
    mobileMp4: { type: ControlType.File, title: "Mobile MP4", allowedFileTypes: ["mp4"] },
    desktopPoster: { type: ControlType.File, title: "Desktop poster", allowedFileTypes: ["jpg", "jpeg", "webp", "png"] },
    mobilePoster: { type: ControlType.File, title: "Mobile poster", allowedFileTypes: ["jpg", "jpeg", "webp", "png"] },
    overlay: { type: ControlType.Number, title: "Overlay", min: 0, max: 0.9, step: 0.05, displayStepper: true },
    breakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1440, step: 1, unit: "px" },
    lazy: {
        type: ControlType.Boolean,
        title: "Lazy load",
        enabledTitle: "Footer",
        disabledTitle: "Hero",
    },
    position: { type: ControlType.String, title: "Focus point", placeholder: "50% 50%" },
})
