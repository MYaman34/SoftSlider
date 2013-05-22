/*! Soft Slider - Beta | http://github.com/MYaman34/SoftSlider */
(function ($) {
    if (!$.SoftSlider) {
        $.fn.SoftSlider = function (Options) {
            if (this.length > 1) {
                this.each(function () { $(this).SoftSlider(Options); });
                return this;
            }

            var base = this;
            var $base = $(base);
            var markActiveSlide = function (index) {
                var elements = [base.Slides];
                if (base.Options.thumbnails.visible) elements.push($("> *", base.Options.thumbnails.element));
                if (base.Options.markers.visible) elements.push($("> *", base.Options.markers.element));
                for (var ei = 0; ei < elements.length; ei++) {
                    if (index == base.Slides.length)
                        elements[ei].removeClass("active").first().addClass("active");
                    else elements[ei].removeClass("active").eq(index).addClass("active");
                }
                base.CurrentSlideIndex = index >= base.Slides.length ? 0 : index < 0 ? base.Slides.length - 1 : index;
            };

            base.Options = $.extend(true, {
                slider: {
                    width: $base.width(),
                    height: $base.height(),
                    startIndex: 1,
                    slideLimit: 0,
                    randomStart: false,
                    randomSlide: false,
                    beforeLoad: function () { },
                    onLoad: function () { }
                },
                slides: {
                    width: typeof Options != "undefined" && typeof Options.slider != "undefined" && typeof Options.slider.width != "undefined" ? Options.slider.width : null || $base.width(),
                    height: typeof Options != "undefined" && typeof Options.slider != "undefined" && typeof Options.slider.height != "undefined" ? Options.slider.height : null || $base.height(),
                    cloneSize: 1,
                    center: true
                },
                animation: {
                    type: "marquee",
                    easing: "swing",
                    duration: 3000,
                    speed: 750,
                    autoPlay: true,
                    pauseOnHover: true,
                    vertical: false,
                    reserve: false,
                    onStart: function () { },
                    onComplete: function () { }
                },
                markers: {
                    visible: true,
                    event: "click",
                    element: $(".SoftSlider-Markers", base)
                },
                thumbnails: {
                    visible: false,
                    event: "mouseover",
                    element: $(".SoftSlider-Thumbnails", base)
                },
                controls: {
                    visible: true,
                    event: "click",
                    prevText: "Previous",
                    nextText: "Next",
                    element: {
                        prev: $(".SoftSlider-Controls .prev", base),
                        next: $(".SoftSlider-Controls .next", base)
                    }
                }
            }, Options);

            base.Initialized = false;
            base.Slider = null;
            base.Wrapper = null;
            base.Slides = null;
            base.SlidesWithClone = null;
            base.CloneLength = null;
            base.Animating = null;
            base.Paused = null;
            base.ActiveTimer = null;
            base.CurrentSlideIndex = null;
            base.OldSlideIndex = null;

            base.Play = function (index, duration, easing, speed, beforeAnimation, afterAnimation) {
                base.Options.animation.duration = duration || base.Options.animation.duration;
                base.Options.animation.autoPlay = true;
                base.Paused = false;
                clearTimeout(base.ActiveTimer);
                base.ActiveTimer = setTimeout(function () {
                    base.ActiveTimer = null;
                    if (index) base.Slide(index, easing, speed, beforeAnimation, afterAnimation);
                    else {
                        var nextIndex = base.Options.slider.randomSlide ? Math.floor(Math.random() * base.Slides.length) : base.CurrentSlideIndex + 1;
                        while (nextIndex == base.CurrentSlideIndex) nextIndex = Math.floor(Math.random() * base.Slides.length);
                        base.Slide(nextIndex, easing, speed, beforeAnimation, afterAnimation);
                    }
                }, base.Options.animation.duration);
                return base;
            };

            base.Pause = function () {
                base.Paused = true;
                clearTimeout(base.ActiveTimer);
                return base;
            };

            base.Prev = function (beforeAnimation, afterAnimation) {
                base.Slide(base.CurrentSlideIndex + (base.Options.animation.reserve ? 1 : -1), null, null, beforeAnimation, afterAnimation);
                return base;
            };

            base.Next = function (easing, speed, beforeAnimation, afterAnimation) {
                base.Slide(base.CurrentSlideIndex + (base.Options.animation.reserve ? -1 : 1), null, null, beforeAnimation, afterAnimation);
                return base;
            };

            base.Slide = function (index, easing, speed, beforeAnimation, afterAnimation) {
                if (!base.Animating) {
                    var realIndex = base.Options.animation.type == "marquee" ? base.CloneLength / 2 + index : index >= base.Slides.length ? 0 : index
                    base.OldSlideIndex = base.CurrentSlideIndex;

                    if (beforeAnimation) beforeAnimation.call(base, realIndex, easing, speed, beforeAnimation, afterAnimation);
                    base.Options.animation.onStart.call(base, realIndex, easing, speed, beforeAnimation, afterAnimation);

                    markActiveSlide(index);

                    base.Animating = true;
                    var after = function () {
                        base.Animating = false;
                        if (base.Options.animation.autoPlay && !base.Paused) base.Play();
                        if (afterAnimation) afterAnimation.call(base, realIndex, easing, speed, beforeAnimation, afterAnimation);
                        base.Options.animation.onComplete.call(base, realIndex, easing, speed, beforeAnimation, afterAnimation);
                    };

                    if (base.Options.animation.type == "marquee") {
                        base.Slider.animate({
                            "left": base.Options.animation.vertical ? 0 : -base.Options.slides.width * (base.CloneLength / 2 + index),
                            "top": base.Options.animation.vertical ? -base.Options.slides.height * (base.CloneLength / 2 + index) : 0
                        }, speed || base.Options.animation.speed, easing || base.Options.animation.easing, function () {
                            if (index >= base.Slides.length)
                                base.Slider.css({
                                    "left": base.Options.animation.vertical ? 0 : -base.Options.slides.width * base.CloneLength / 2,
                                    "top": base.Options.animation.vertical ? -base.Options.slides.height * base.CloneLength / 2 : 0
                                });
                            else if (index < 0)
                                base.Slider.css({
                                    "left": base.Options.animation.vertical ? 0 : -base.Options.slides.width * (base.CloneLength / 2 + base.Slides.length - 1),
                                    "top": base.Options.animation.vertical ? -base.Options.slides.height * (base.CloneLength / 2 + base.Slides.length - 1) : 0
                                });
                            after();
                        });
                    }
                    else {
                        base.Slides.eq(base.OldSlideIndex).css("z-index", 0).fadeOut(speed * 0.7 || base.Options.animation.speed, easing || base.Options.animation.easing);
                        base.Slides.eq(realIndex).css("z-index", 1).fadeIn(speed || base.Options.animation.speed, easing || base.Options.animation.easing, function () {
                            after();
                        });
                    }
                }
                return base;
            };

            base.Setup = function () {
                if (base.Initialized) return base;
                else base.Initialized = true;

                base.Options.slider.beforeLoad.call(base);

                base.Slider = $(".SoftSlider", base);
                base.Wrapper = base.Slider.wrap('<div/>').parent().addClass("SoftSlider-Wrapper").css({ "width": base.Options.slider.width, "height": base.Options.slider.height, "position": "relative", "overflow": "hidden" });
                base.Slides = $("> *", base.Slider);
                base.Animating = false;
                base.Paused = false;
                base.CurrentSlideIndex = base.Options.slider.randomStart || base.Options.slider.randomSlide ? Math.floor(Math.random() * base.Slides.length) : base.Options.slider.startIndex - 1;

                if (base.Options.slideLimit > 0) {
                    $(".SoftSlider > *", base).eq(base.Options.slideLimit - 1).nextAll().remove();
                }

                if (base.Options.animation.type == "marquee") {
                    for (var ci = 0; ci < base.Options.slides.cloneSize; ci++) {
                        var clone = base.Slides.clone().attr("data-type", "clone");
                        base.Slider.prepend(clone).append(clone.clone());
                    }

                    base.SlidesWithClone = $("> *", base.Slider).css({
                        "width": base.Options.slides.width,
                        "height": base.Options.slides.height,
                        "position": "relative",
                        "float": "left"
                    });

                    base.CloneLength = (base.SlidesWithClone.length - base.Slides.length);
                    base.Slider.css({
                        "width": base.Options.animation.vertical ? base.Options.slides.width : base.Options.slides.width * base.SlidesWithClone.length,
                        "height": base.Options.animation.vertical ? base.Options.slides.height * base.SlidesWithClone.length : base.Options.slides.height,
                        "position": "absolute",
                        "left": base.Options.animation.vertical ? 0 : -base.Options.slides.width * (base.CloneLength / 2 + base.CurrentSlideIndex),
                        "top": base.Options.animation.vertical ? -base.Options.slides.height * (base.CloneLength / 2 + base.CurrentSlideIndex) : 0,
                        "margin-left": base.Options.animation.vertical ? 0 : base.Options.slides.center ? -(base.Options.slides.width - base.Options.slider.width) / 2 : 0,
                        "margin-top": base.Options.animation.vertical ? base.Options.slides.center ? -(base.Options.slides.height - base.Options.slider.height) / 2 : 0 : 0
                    });
                }
                else {
                    base.Slider.css({
                        "width": base.Options.slider.width,
                        "height": base.Options.slider.height
                    });
                    base.Slides.css({
                        "width": base.Options.slides.width,
                        "height": base.Options.slides.height,
                        "position": "absolute",
                        "display": "none"
                    });
                    base.Slides.eq(base.CurrentSlideIndex).show();
                }

                if (base.Options.thumbnails.visible) {
                    if (!base.Options.thumbnails.element.length) {
                        base.Options.thumbnails.element = $(".SoftSlider-Thumbnails", base.Wrapper.append('<ul class="SoftSlider-Thumbnails"/>'));
                        base.Slides.each(function () {
                            base.Options.thumbnails.element.append($("<li/>").html($("img", this).clone()));
                        });
                    }
                    else if ($base.has(".SoftSlider-Thumbnails"))
                        base.Options.thumbnails.element = $(".SoftSlider-Thumbnails", base).appendTo(base.Wrapper);

                    $("> *", base.Options.thumbnails.element).bind(base.Options.thumbnails.event, function () {
                        if ($(this).index() != base.CurrentSlideIndex) {
                            if (base.Animating) {
                                if (base.Options.animation.type == "fade") base.Slides.eq(base.CurrentSlideIndex).stop(true, true);
                                else base.Slider.stop();
                                base.Animating = false;
                            }
                            base.Slide($(this).index(), base.Options.thumbnails.event == "mouseover" ? "linear" : null);
                        }
                    });

                    base.Options.thumbnails.element.show().css({ "z-index": "1" });
                }
                else if (base.Options.thumbnails.element.length) base.Options.thumbnails.element.remove();

                if (base.Options.markers.visible) {
                    if (!base.Options.markers.element.length) {
                        base.Options.markers.element = $(".SoftSlider-Markers", base.Wrapper.append('<ul class="SoftSlider-Markers"/>'));
                        for (var si = 1; si <= base.Slides.length; si++) base.Options.markers.element.append("<li>" + si + "</li>");
                    }
                    else if ($base.has(".SoftSlider-Markers"))
                        base.Options.markers.element = $(".SoftSlider-Markers", base).appendTo(base.Wrapper);

                    $("> *", base.Options.markers.element).bind(base.Options.markers.event, function () {
                        if ($(this).index() != base.CurrentSlideIndex) {
                            if (base.Animating) {
                                if (base.Options.animation.type == "fade") base.Slides.eq(base.CurrentSlideIndex).stop(true, true);
                                else base.Slider.stop();
                                base.Animating = false;
                            }
                            base.Slide($(this).index(), base.Options.markers.event == "mouseover" ? "linear" : null);
                        }
                    });

                    base.Options.markers.element.show().css({ "z-index": "1" });
                }
                else if (base.Options.markers.element.length) base.Options.markers.element.remove();

                if (base.Options.controls.visible) {
                    if (!base.Options.controls.element.prev.length || !base.Options.controls.element.next.length) {
                        var controls = $(".SoftSlider-Controls", base.Wrapper.append('<div class="SoftSlider-Controls">' +
                                            '<div class="prev">' + base.Options.controls.prevText + '</div>' +
                                            '<div class="next">' + base.Options.controls.nextText + '</div>' +
                                        '</div>'));
                        base.Options.controls.element.prev = $(".prev", controls);
                        base.Options.controls.element.next = $(".next", controls);
                    }
                    else if ($base.has(".SoftSlider-Controls"))
                        base.Options.controls.element = $(".SoftSlider-Controls", base).appendTo(base.Wrapper);

                    $(base.Options.controls.element.prev).bind(base.Options.controls.event, function () {
                        base.Prev();
                        return false;
                    });
                    $(base.Options.controls.element.next).bind(base.Options.controls.event, function () {
                        base.Next();
                        return false;
                    });
                    base.Options.controls.element.next.parent().css("z-index", "1");
                    base.Options.controls.element.prev.show();
                    base.Options.controls.element.next.show();
                }
                else if (base.Options.controls.element.prev.length || base.Options.controls.element.next.length) {
                    base.Options.controls.element.prev.remove();
                    base.Options.controls.element.next.remove();
                }

                if (base.Options.animation.pauseOnHover && base.Options.animation.autoPlay) {
                    $base.mouseenter(function () {
                        base.Pause();
                    }).mouseleave(function () {
                        base.Play();
                    });
                }

                markActiveSlide(base.CurrentSlideIndex);
                base.Slider.show();

                if (base.Options.animation.autoPlay) base.Play();

                base.Options.slider.onLoad.call(base);

                return base;
            };

            return base;
        };
    }
})(jQuery);