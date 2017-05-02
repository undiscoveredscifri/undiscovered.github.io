$(document).ready(function(){
  var muted = false;
  var galleries = [];
   if ($(window).width() <= 768 || isMobile) {
    $(window).on('resize', function(){
        if ($(window).width() > 768 && !isMobile) {
            location.reload();

        }

    });
    return;
   }
   $('.ajmint-audio-gallery-control').click(function(){
    muted = !muted;
    if (!muted){
      $('#ajmint-audio-gallery-text').html('Mute Off');
      $('#ajmint-audio-gallery-image').attr('src','images/playing.gif');
      _.each(galleries, function($gallery){
        if ($gallery.hasClass('enabled') && $gallery.pop) {
          fadeIn($gallery.pop);
          
          

        }

      });
    }
    else {
      // Not muted
      $('#ajmint-audio-gallery-text').html('Mute On');
      $('#ajmint-audio-gallery-image').attr('src','images/mute.gif');
      _.each(galleries, function($gallery){
        if ($gallery.hasClass('enabled') && $gallery.pop) {
          $gallery.pop.volume(0);
          $gallery.pop.pause();
        }

      });
    }

   });
   $(window).on('resize', function(){
   $('.scroll-gallery section .img').height(window.innerHeight - headerHeight);
   $('.last-section .img').height(window.innerHeight + 10);
    if ($(window).width() <= 768 && !isMobile) {
        location.reload();

    }

   });
   
   function fadeIn(pop){
    $('.ajmint-audio-gallery-control').show();
    if (!pop || pop.fadeInTimeout || !pop.paused() || muted) {
      return;
     }

    if (pop.fadeOutTimeout) {
      clearTimeout(pop.fadeOutTimeout);
      pop.fadeOutTimeout = null;
    }
      function fadeInLoop(){
        var volume = pop.volume();
        if (volume >= 0.9) {
          pop.volume(1);
          clearTimeout(pop.fadeInTimeout);
          pop.fadeInTimeout = null;
          return;
        }
        if(pop.paused()){
          pop.play();
        }
        pop.volume(volume += 0.1);

        pop.fadeInTimeout = setTimeout(fadeInLoop, 100);
      }
      pop.volume(0);
      fadeInLoop();

  }

   function fadeOut(pop){
    $('.ajmint-audio-gallery-control').hide();
    if (!pop || pop.fadeOutTimeout) {
      return;

    }
    if (pop.fadeInTimeout) {
      clearTimeout(pop.fadeInTimeout);
      pop.fadeInTimeout = null;
    }
    
      function fadeOutLoop(){
        var volume = pop.volume();
        if (volume < 0.1) {
          pop.volume(0);
          pop.pause();
          clearTimeout(pop.fadeOutTimeout);
          pop.fadeOutTimeout = null;
          return;
        }
        pop.volume(volume - 0.1);

        pop.fadeOutTimeout = setTimeout(fadeOutLoop, 150);
      }
      fadeOutLoop();


   }
   
   // Set each page of gallery to full height
   var headerHeight = 50;
   var playing = false;
   $('.scroll-gallery section').height(window.innerHeight);
   var windowHeight = window.innerHeight;
   $('.scroll-gallery img').each(function(i, elt){
    var $elt = $(elt);
    var src = $elt.attr('src');
    var centerClass = $elt.data('center') || 'center center';

    $elt.replaceWith('<div class="img" style="background-image: url(' + src + '); background-position: ' + centerClass + '"></div>');
   });
   $('.scroll-gallery section .img').height(window.innerHeight - headerHeight);
   $('.last-section .img').height(window.innerHeight + 10);


   function activate($gallery, section, nofade) {
        // Activate a particular page of the gallery
        

        var $dots = $gallery.find('.dot');
        var $sections = $gallery.find('section');
        var nsections = $sections.length;
        var $oldsection = $gallery.find('section.active');
        var newsection = $sections[section];
        var $newsection = $(newsection);

        // Make sure gallery is turned on
        if (!$gallery.hasClass('enabled')) {
          $gallery.addClass('enabled');
          fadeIn($gallery.pop);
        }

        // Set the dots appropriately
        $dots.removeClass('active');
        $($dots[section]).addClass('active');

        if (newsection) {
           // Update which page we're on
           $gallery.data('section', section);

        }
        if (newsection && !$newsection.hasClass('active')) {
            // Transition comes elsewhere
                $newsection.addClass('active');
                $oldsection.removeClass('active');
        }
        if (section >= nsections || section < 0) {
            // If they are trying to leave the gallery, turn it off
            $gallery.disable();
            fadeOut($gallery.pop);

        }
        if (section < 0) {
            $oldsection.find('*').css('opacity', 1);
        }
        if (isMobile && !newsection && section > 0) {
            // They're leaving the gallery
            // make sure to let them
            $(window).scrollTop(section * (windowHeight / $gallery.data('velocity')) + $gallery.offset().top + 10);

        }
        if (!nofade) {
            $gallery.find('section *').css('opacity', 0);
            $gallery.find('section.active *').css('opacity', 1);
        }
    }
    function transition($gallery, section) {
        // Animations for mobile
        
        var selector;
        if (section >= 0) {
            selector = 'section.active *, section:eq(' + section + ') *';
        }
        else {
            selector = 'section.active *';
        }

        $gallery.find(selector).animate({
            // Fade out current section and fade in new section
            // Then switch over completely

            opacity: 0.5}, 400, "swing", function(){
            activate ($gallery, section, true);
            $gallery.find('section *').css('opacity', 0);
            $gallery.find('section.active *').css('opacity', 1);
        
        });

    }
   $('.scroll-gallery').each(function(i, gallery) {
        // Set up the galleries
        
        var $gallery = $(gallery);
        galleries.push($gallery);
        var $sections = $gallery.find('section');
        var nsections = $sections.length;
        var velocity = $gallery.data('velocity') || 1;
        // Refine the heights based on velocity
        // if ($sections[nsections] > 1) {

        $($sections[nsections-1]).addClass('last-section');
        $('.last-section .img').height(window.innerHeight + 10);
        
        // }

        // else {
        //   $($sections).removeClass('last-section');
        // }
        var sectionHeight = windowHeight / $gallery.data('velocity');
        var $firstImg = $gallery.find('section:eq(0) .img');
        var $lastImg = $gallery.find('section:eq(-1) .img');
        var firstOffset = (windowHeight - headerHeight - $firstImg.height()) / 2 + headerHeight;
        var lastOffset = (windowHeight - headerHeight - $lastImg.height()) / 2 ;
        var pop = null;
        $gallery.disable = function(){
            $gallery.removeClass('enabled');
            fadeOut(pop);
        };
        if ($gallery.data('audio') && !isMobile) {
          // Autoplaying audio
          var audiourl = $gallery.data('audio');
          audio = true;

          var audioTag = '<audio class="ajamint-gallery-audio" id="ajamint-gallery-audio-' + i + '" preload="auto"><source src="' + audiourl + '.mp3" type="audio/mp3" /><source src="' + audiourl + '.ogg" type="audio/ogg" /></audio>';
          $gallery.append(audioTag);
          $gallery.pop = pop = Popcorn('#ajamint-gallery-audio-' + i);
          pop.loop(true);

        }

        if (isMobile) {
            $gallery.css({ // Give a little breathing room at the bottom
                height: $sections.length * sectionHeight + 100

            });

        }
        else {
            $gallery.css({
                // Give a little breathing room at the bottom
                height: $sections.length * sectionHeight + 0.99 * windowHeight

            });

        }

        var $nav = $gallery.find('.nav');
        $sections.each(function(j, section) {
            // Set up the nav dots
            var $section = $(section);
            $nav.append('<div class="dot' + (j==0 ? ' active' : '') + '" data-section="' + j + '"></div>');
        });

        $gallery.find(".dot").click(function(){
            if (!$gallery.hasClass('enabled'))
            {
                return;
            }
            if (isMobile) {
                activate($gallery, $(this).data('section'), true);
            }
            else {
                // Just scroll to the right place, let the handler take over
                
                
                var section = $(this).data('section');
                if (section == nsections - 1) {
                    $(window).scrollTop($gallery.offset().top + $(this).data('section') * sectionHeight + sectionHeight / 3);

                }
                else {
                    $(window).scrollTop($gallery.offset().top + $(this).data('section') * sectionHeight + sectionHeight / 2);
                }



            }

        });
        if (isMobile) {
           $(window).scroll(function(){
            // Sample these each time in case we redrew the page, etc.
            var scrollTop = $(window).scrollTop();
            var galleryTop = $gallery.offset().top;

            if ($gallery.hasClass('enabled') || scrollTop < galleryTop || scrollTop > galleryTop + nsections * (windowHeight / $gallery.data('velocity')))
            {
                // We're not in the gallery or it's already enabled
                return;
            }
            // Where are we going?
            var newSection = Math.floor((scrollTop - galleryTop) / (windowHeight / velocity));
            $gallery.addClass('enabled');
            fadeIn($gallery.pop);

            activate($gallery, newSection);

           });
           $gallery.touchwipe({
           wipeDown: function(){
                // They're moving to the next page
            
                var curSection = $gallery.data('section');
                if ($(window).scrollTop() > $gallery.offset().top + nsections * (windowHeight / $gallery.data('velocity')))
                {
                    // They're trying to scroll away

                    return;

                }
                if (!$gallery.hasClass('enabled') || _.isUndefined(curSection)) {
                    curSection = -1;
                }
                transition($gallery, curSection+1);
                $gallery.find('section *').css('opacity', 0);
                $gallery.find('section.active *').css('opacity', 1);
                $(window).scrollTop($gallery.offset().top + (curSection + 1) * windowHeight / $gallery.data('velocity') + 1);

           },
           wipeUp: function(){
                // Previous page
                var curSection = $gallery.data('section');
                if ($(window).scrollTop() < $gallery.offset().top) {
                    // They're trying to scroll away
                    $gallery.disable();
                    $(window).scrollTop($(window).scrollTop() - headerHeight);
                    return;

                }
                if (!$gallery.hasClass('enabled') || _.isUndefined(curSection)) {
                    curSection = $sections.length;
                }
                transition($gallery, curSection-1);
                $gallery.find('section *').css('opacity', 0);
                $gallery.find('section.active *').css('opacity', 1);
                if (curSection - 1 >= 0) {
                    $(window).scrollTop($gallery.offset().top + (curSection - 1) * windowHeight / $gallery.data('velocity') + 1);
                }
                else {
                    // Scrolling above
                    $(window).scrollTop($gallery.offset().top - 150);

                }

           }
         });

        }

        else { /* Not mobile */
            var nsections = $sections.length;
            
            var oldScrolltop = 0;
            $(window).scroll(function(e){
                // Sample these each time in case page reflowed
                var galleryTop = $gallery.offset().top - headerHeight;
                var galleryEnd = galleryTop + nsections * (windowHeight / velocity);
                

                var scrollTop = $(window).scrollTop();
                if (!$gallery.hasClass('enabled') && !(scrollTop >=galleryTop && scrollTop < galleryEnd))
                {
                    // If we're not scrolling into gallery
                    // and didn't start in it
                    if (scrollTop < galleryTop) {
                        // Scroll them up through the top
                        
                        $sections.removeClass('active');
                        $gallery.find('section:first').addClass('active');
                    }
                    else if (scrollTop > galleryEnd) {
                        // Scroll them down through the bottom
                        $sections.removeClass('active');
                        $gallery.find('section:last').addClass('active');

                    }
                    return;
                }
                var wasEnabled = $gallery.hasClass('enabled');
                var curSection = $gallery.data('section');

                // What section are we visiting and how far into it
                var newSection = Math.floor((scrollTop - galleryTop) / (windowHeight / velocity));
                var sectionFraction = (scrollTop - galleryTop) / (windowHeight / velocity) - newSection;
                if (newSection >= 0) {
                    $gallery.addClass('enabled');
                    fadeIn($gallery.pop);
                }

                if (newSection != curSection || !wasEnabled) {
                    activate($gallery, newSection);

                }
                if (sectionFraction > 0.99 && newSection == nsections - 1) {
                    // Transition out of bottom
                    //$gallery.find('.last-section').css('top', (windowHeight / velocity) * (nsections - 2) + 50);
                    $gallery.disable();
                    fadeOut(pop);


                }
                else if (sectionFraction > 0.5 && sectionFraction < 1 && newSection < nsections - 1 && newSection >= 0) {
                        // Transitions if we're about to move to a new section
                        $gallery.find('section.active *').css({
                            opacity: (1.5 - sectionFraction)

                        });
                        if (curSection < nsections - 1) {
                            $gallery.find('section.active').next().find("*").css({
                                opacity: 1- (1.5 - sectionFraction)
                            });
                        }
                }
                else if (sectionFraction < 0.5 && sectionFraction >= 0){
                        $gallery.find('section *').css({
                            opacity: 0
                        });
                        $gallery.find('section.active *').css({
                            opacity: 1

                        });

                }
                var newsectionFraction = (scrollTop - galleryTop) / (windowHeight / velocity) - newSection;
                $gallery.find('.gallery-caption').each(function(i, elt){
                    var $elt = $(elt);
                    $elt.css({
                        // Position captions -- rough formula, works decently
                        left: $elt.data('left') || '50px',
                        top: (100 * (1 - newsectionFraction)) - 5 + '%'
                    });
                });
                e.preventDefault();
                return false;

                

            });
        }
        $gallery.on('click', '.caption-toggle', function(){
            // Toggle captions for small screens
            $gallery.toggleClass('show-captions hide-captions');
        });

        
    });

    



});