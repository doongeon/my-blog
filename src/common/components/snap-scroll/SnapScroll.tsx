import { useEffect, useRef, useState } from "react";
import { GalleryPhoto } from "../../../components/philosophy/Philosophy";
import { galleryModalOnAtom } from "../../../util/atom";
import { useSetRecoilState } from "recoil";
import "./snap-scroll.css";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/16/solid";

interface SnapScrollProps {
  scrollItems: GalleryPhoto[];
}

export default function SnapScroll({ scrollItems }: SnapScrollProps) {
  const turnOnGalleryModalState = useGalleryModalOn();
  const {
    snapScrollRef,
    currentIndex,
    isSnapScrollContainerIntersecting,
    isFadeInAnimationEnd,
    isLastSnapScrollItemIntersecting,
    onScroll,
    onClickScrollLeft,
    onClickScrollRight,
  } = useSnapScroll();

  return (
    <div className="snap-scroll-container">
      <div className="snap-scroll" ref={snapScrollRef} onScroll={onScroll}>
        {scrollItems.map((scrollItem, index) => {
          return (
            <div
              key={index}
              className={`snap-scroll-item-container ${
                isSnapScrollContainerIntersecting ? "fade-in-animation" : ""
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className={`snap-scroll-item`}
                onClick={turnOnGalleryModalState}
              >
                <div className="snap-scroll-item__text-wrapper">
                  <h3 className="snap-scroll-item__title">
                    {scrollItem.title}
                  </h3>
                  <p className="snap-scroll-item__subtitle">
                    <span>{scrollItem.quote}</span>
                    <span>{scrollItem.source}</span>
                  </p>
                </div>
                <div className="snap-scroll-item__image-container">
                  <img
                    className="snap-scroll-item__image gallery-item__image"
                    src={scrollItem.photo}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`snap-scroll-btn-container`}>
        <button
          className={`snap-scroll-btn ${
            isSnapScrollContainerIntersecting ? "fade-in-animation" : ""
          }`}
          onClick={onClickScrollLeft}
        >
          <ArrowLeftCircleIcon
            className={`snap-scroll-btn__icon ${
              currentIndex === 0 || !isFadeInAnimationEnd
                ? "snap-scroll-btn__icon-disabled"
                : ""
            }`}
          />
        </button>
        <button
          className={`snap-scroll-btn ${
            isSnapScrollContainerIntersecting ? "fade-in-animation" : ""
          }`}
          onClick={onClickScrollRight}
        >
          <ArrowRightCircleIcon
            className={`snap-scroll-btn__icon ${
              isLastSnapScrollItemIntersecting || !isFadeInAnimationEnd
                ? "snap-scroll-btn__icon-disabled"
                : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function useGalleryModalOn() {
  const setIsGalleryModalOn = useSetRecoilState(galleryModalOnAtom);

  function turnOnGalleryModalState() {
    setIsGalleryModalOn(true);
  }

  return turnOnGalleryModalState;
}

function useSnapScroll() {
  const snapScrollRef = useRef<HTMLDivElement | null>(null);
  const [isFadeInAnimationEnd, setIsFadeInAnimationEnd] = useState(false);
  const [isScroll, setIsScroll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [
    isSnapScrollContainerIntersecting,
    setIsSnapScrollContainerIntersecting,
  ] = useState(false);
  const [
    isLastSnapScrollItemIntersecting,
    setIsLastSnapScrollItemIntersecting,
  ] = useState(false);

  // observe whether scroller is intersecting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting)
          setIsSnapScrollContainerIntersecting(() => true);
      },
      { threshold: 0.6 }
    );
    observer.observe(snapScrollRef.current!);

    return () => {
      observer.disconnect();
    };
  });

  // observe end of scroll items animation
  useEffect(() => {
    const snapScrollItems = snapScrollRef.current?.children;
    const lastSnapScrollItem = snapScrollItems![snapScrollItems!.length - 1];

    lastSnapScrollItem.addEventListener("animationend", () =>
      setIsFadeInAnimationEnd(() => true)
    );

    return lastSnapScrollItem.removeEventListener("animationend", () =>
      setIsFadeInAnimationEnd(() => true)
    );
  });

  // observe last scroll item intersecting
  useEffect(() => {
    const snapScrollItems = snapScrollRef.current?.children;
    const lastSnapScrollItem = snapScrollItems![snapScrollItems!.length - 1];

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
          setIsLastSnapScrollItemIntersecting(() => true);
        } else {
          setIsLastSnapScrollItemIntersecting(() => false);
        }
      },
      {
        threshold: 1.0,
        rootMargin: "0px -10px 0px 0px",
      }
    );

    observer.observe(lastSnapScrollItem);

    return () => {
      observer.disconnect();
    };
  });

  // set closest item from scroll as current
  const onScroll = () => {
    setIsScroll(() => true);
    const snapScrollItems = Array.from(
      snapScrollRef.current!.children
    ) as HTMLDivElement[];
    let currentIndex = 0;
    let nearestDistance = Math.abs(
      snapScrollRef.current!.scrollLeft - snapScrollItems[0].offsetLeft
    );
    snapScrollItems.forEach((item, index) => {
      const distance = Math.abs(
        snapScrollRef.current!.scrollLeft - item.offsetLeft
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        currentIndex = index;
      }
    });

    setCurrentIndex(() => currentIndex);
    setIsScroll(() => false);
  };

  // scroll to right 1 item
  const onClickScrollRight = () => {
    if (!isFadeInAnimationEnd) return;
    if (isScroll) return;

    const snapScrollItems = Array.from(
      snapScrollRef.current!.children
    ) as HTMLDivElement[];

    if (!isLastSnapScrollItemIntersecting) {
      snapScrollItems[currentIndex + 1].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  //scroll to left 1 item
  const onClickScrollLeft = () => {
    if (!isFadeInAnimationEnd) return;
    if (isScroll) return;
    const snapScrollItems = Array.from(
      snapScrollRef.current!.children
    ) as HTMLDivElement[];

    if (currentIndex > 0) {
      snapScrollItems[currentIndex - 1].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  return {
    snapScrollRef,
    currentIndex,
    isFadeInAnimationEnd,
    isLastSnapScrollItemIntersecting,
    isSnapScrollContainerIntersecting,
    onScroll,
    onClickScrollLeft,
    onClickScrollRight,
  };
}
