(function() {
  $(function() {

    // Variables
    var SCROLL_SPEED_MULTIPLIER =  1, 
        $window =                  $(window),
        $body =                    $('body'),
        $intro =                   $('.intro'),
        $name =                    $('.name'),
        $medium =                  $('.medium'),
        bodyHeight =               0,
        windowHeight =             0,
        prevKeyframesDurations =   0,
        scrollTop =                0,
        relativeScrollTop =        0,
        currentKeyframe =          0,
        keyframes = [
          {
            'duration' : '150%',
            'animations' :  [
              {
                'selector'    : '.intro',
                'translateY'  : -100,
                'opacity'     : 0
              } , {
                'selector'    : '.name',
                'translateY'  : -20
              }
            ]
          } , {
            'duration' : '300%',
            'animations' :  [
              {
                'selector'    : '.medium-byline',
                'translateY'  : '-25%'
              } , {
                'selector'    : '.medium-byline-1',
                'opacity'     : [0, 1.75] // hack to accelrate opacity speed
              } , {
                'selector'    : '.raw-page',
                'translateY'  : '-90%'
              }
            ]
          } , {
            'duration' : '80%',
            'animations' :  []
          } , {
            'duration' : '250%',
            'animations' :  [
              {
                'selector'    : '.medium-byline-2',
                'opacity'     : [0, 1]
              } , {
                'selector'    : '.medium-byline-1',
                'opacity'     : [1, .3]
              } , {
                'selector'    : '.iphone',
                'translateY'  : '-66%'
              } , {
                'selector'    : '.raw-page',
                'translateY'  : ['-90%', '-90%'],
              }
            ]
          } , {
            'duration' : '80%',
            'animations' :  []
          } , {
            'duration' : '250%',
            'animations' :  [
              {
                'selector'    : '.medium-byline-3',
                'opacity'     : [0, 1]
              } , {
                'selector'    : '.medium-byline-2',
                'opacity'     : [1, .3]
              }
            ]
          } , {
            'start' : 0,// the keyframe at which you want the animations to start
            'duration' : '100%',
            'animations' :  []
          } 
        ]

    init = function() {
      $window.on('scroll', onScroll);
      buildPage();
    }

    buildPage = function() {
      var i, j, k;
      scrollTop = $window.scrollTop();
      windowHeight = $window.height();
      for(i=0;i<keyframes.length;i++) { // loop keyframes
          keyframes[i].duration = convertPercentToPx(keyframes[i].duration);
          bodyHeight += keyframes[i].duration;
          for(j=0;j<keyframes[i].animations.length;j++) { // loop animations
            Object.keys(keyframes[i].animations[j]).forEach(function(key) { // loop properties
              value = keyframes[i].animations[j][key];
              if(key !== 'selector') {
                if(value instanceof Array) { // if its an array
                  for(k=0;k<value.length;k++) { // if value in array is %
                    if(typeof value[k] === "string") {
                      value[k] = convertPercentToPx(value[k]);
                    }
                  } 
                } else {
                  var valueSet = [];
                  if(typeof value === "string") { // if single value is a %
                    value = convertPercentToPx(value);
                  }
                  valueSet.push(getDefaultPropertyValue(key), value);
                  value = valueSet;
                }
                keyframes[i].animations[j][key] = value;
              }
            });
          }
      }
      $body.height(bodyHeight);
      $window.scroll(0);
    }

    getDefaultPropertyValue = function(property) {
      switch (property) {
        case 'translateX':
          return 0;
        case 'translateY':
          return 0;
        case 'scale':
          return 1;
        case 'opacity':
          return 1;
        default:
          return null;
      }
    };

    onScroll = function() {
      setScrollTops();
      animateElements();
      setKeyframe();
    }

    calcPropValue = function(animation, property) {
      var value = animation[property];
      if(value) {
        value = easeInOutQuad(relativeScrollTop, value[0], (value[1]-value[0]), keyframes[currentKeyframe].duration);
      } else {
        value = getDefaultPropertyValue(property);
      }
      value = +value.toFixed(2)
      return value;
    }

    setScrollTops = function() {
      scrollTop = $window.scrollTop();
      relativeScrollTop = scrollTop - prevKeyframesDurations;
    }

    animateElements = function() {
      var animation, translateY, translateX, scale, opacity;
      // var animating = setInterval(function() {
        for(var i=0;i<keyframes[currentKeyframe].animations.length;i++) {
          animation   = keyframes[currentKeyframe].animations[i];
          translateY  = calcPropValue(animation, 'translateY', 'easeOut');
          translateX  = calcPropValue(animation, 'translateX', 'easeOut');
          scale       = calcPropValue(animation, 'scale', 'easeOut');
          opacity     = calcPropValue(animation, 'opacity', 'easeOut');

          $(animation.selector).css({
            '-webkit-transform': 'translate3d(' + translateX +'px, ' + translateY + 'px, 0) scale('+ scale +')',
            'opacity' : opacity
          })

        }
      // }, 40);
    };

    easeInOutQuad = function (t, b, c, d) {
      // return c*t/d + b;
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };

    setKeyframe = function() {
      // console.log(currentKeyframe + ': ' + scrollTop + ' needs to be greater than ' + (keyframes[currentKeyframe].duration + prevKeyframesDurations) + ' and lower than ' + (bodyHeight - windowHeight) + ' to advance to next keyframe');
      if(scrollTop > (keyframes[currentKeyframe].duration + prevKeyframesDurations) && scrollTop <= (bodyHeight - windowHeight)) {
          prevKeyframesDurations += keyframes[currentKeyframe].duration;
          currentKeyframe++;
      } else if(scrollTop < prevKeyframesDurations && scrollTop > 0) {
          currentKeyframe--;
          prevKeyframesDurations -= keyframes[currentKeyframe].duration;
      }
    }

    convertPercentToPx = function(value) {
      if(typeof value === "string" && value.match(/%/g)) {
          value = (parseFloat(value) / 100) * windowHeight;
      }
      return value;
    }

    init();

  })
}).call(this);


/*

Thanks for http://www.gizma.com/easing/ for providing the easing 
To http://www.kirupa.com/forum/showthread.php?378287-Robert-Penner-s-Easing-Equations-in-Pure-JS-(no-jQuery) for helping me understand easing
To Dropbox Team for not obfuscating their JS which made this project much easier to complete


*/