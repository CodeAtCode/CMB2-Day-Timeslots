( function( $ ) {
  'use strict';

  var DayScheduleSelector = function( el, options ) {
    this.$el = $( el );
    this.options = $.extend( {}, DayScheduleSelector.DEFAULTS, options );
    this.render();
    this.attachEvents();
	this.$selectingStart = null;
  };

  DayScheduleSelector.DEFAULTS = {
    days: [ 0, 1, 2, 3, 4, 5, 6 ], // Sun - Sat
    startTime: '08:00', // HH:mm format
    endTime: '20:00', // HH:mm format
    interval: 30, // minutes
    timeFormat: '24', // 24 or 12 supported
    stringDays: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
    template: '<div class="day-schedule-selector">' +
      '<table class="schedule-table">' +
      '<thead class="schedule-header"></thead>' +
      '<tbody class="schedule-rows"></tbody>' +
      '</table>' +
      '<div>'
  };

  /**
   * Render the calendar UI
   * @public
   */
  DayScheduleSelector.prototype.render = function() {
    this.$el.html( this.options.template );
    this.renderHeader();
	this.renderRows();
  };

  /**
   * Render the calendar header
   * @public
   */
  DayScheduleSelector.prototype.renderHeader = function() {
    var stringDays = this.options.stringDays;
    var days = this.options.days;
    var html = '';

    $.each( days, function( i, _ ) {
      html += '<th>' + ( stringDays[ _ ] || '' ) + '</th>';
    } );
    this.$el.find( '.schedule-header' ).html( '<tr><th></th>' + html + '</tr>' );
  };

  /**
   * Render the calendar rows, including the time slots and labels
   * @public
   */
  DayScheduleSelector.prototype.renderRows = function() {
    var plugin = this;
    var start = this.options.startTime;
    var end = this.options.endTime;
    var interval = this.options.interval;
    var days = this.options.days;
    var $el = this.$el.find( '.schedule-rows' );

    $.each( generateDates( start, end, interval ), function( i, d ) {
      var daysInARow = $.map( new Array( days.length ), function( _, i ) {
        return '<td class="time-slot" data-time="' + hhmm( d ) + '" data-day="' + days[ i ] + '"></td>';
      } ).join();

      $el.append( '<tr><td class="time-label">' + plugin.hmmAmPm( d ) + '</td>' + daysInARow + '</tr>' );
    } );
  };

  /**
   * Is the day schedule selector in selecting mode?
   * @public
   */
  DayScheduleSelector.prototype.isSelecting = function() {
    return !!this.$selectingStart;
  };

  DayScheduleSelector.prototype.select = function( $slot ) {
    $slot.attr( 'data-selected', 'selected' );
  };
  DayScheduleSelector.prototype.deselect = function( $slot ) {
    $slot.removeAttr( 'data-selected' );
  };

  function isSlotSelected( $slot ) {
    return $slot.is( '[data-selected]' );
  }

  function isSlotSelecting( $slot ) {
    return $slot.is( '[data-selecting]' );
  }

  /**
   * Get the selected time slots given a starting and a ending slot
   * @private
   * @returns {Array} An array of selected time slots
   */
  DayScheduleSelector.prototype.getSelection = function() {
    return this.serialize();
  };

  /**
   * Get the selected time slots split for every slots
   * @private
   * @returns {Array} An array of selected time slots
   */
  DayScheduleSelector.prototype.getSelection_full = function() {
	var plugin = this;
	var selections = {};

	$.each( this.options.days, function( _, v ) {
		selections[ v ] = [];
		plugin.$el.find( ".time-slot[data-day='" + v + "']" ).each( function( index, el ) {
			if ( isSlotSelected( $( this ) ) ) {
				selections[ v ].push( [ $( this ).data( 'time' ), plugin.$el.find( ".time-slot[data-day='" + v + "']" ).eq(index + 1).data( 'time' ) ] );
			}
		} );
	} );
	return selections;
  };

  DayScheduleSelector.prototype.attachEvents = function() {
    var plugin = this;
    var options = this.options;
    var $slots, purpose;

    this.$el.on( 'click', '.time-slot', function() {
      var day = $( this ).data( 'day' );
      var bodyElement = $( 'html, body' );
      purpose = isSlotSelected( $( this ) ) ? 'deselecting' : 'selecting';
      if ( !plugin.isSelecting() ) { // if we are not in selecting mode
        plugin.$selectingStart = $( this );
        $( this ).attr( 'data-selecting', purpose );
        plugin.$el.find( '.time-slot' ).attr( 'data-disabled', 'disabled' );
        plugin.$el.find( '.time-slot[data-day="' + day + '"]' ).removeAttr( 'data-disabled' );
        plugin.$el.trigger( 'dataChanged', [ plugin.serialize() ] );
        if ( isSlotSelected( $( this ) ) ) {
          plugin.deselect( $( this ) );
        } else { // then start selecting
          bodyElement.on( 'mouseleave', function( event ) {
            var leftPageY = event.pageY;
            var scrollTop = bodyElement.scrollTop();
            var windowHeight = $( window ).height();
            var pageCenter = scrollTop + ( windowHeight / 2 );
            var isScrollDown = ( leftPageY > pageCenter );
            var scrollDelta = isScrollDown ? 5 : -5;
            var scrollInterval = 50;
            var scrollTarget = leftPageY - ( isScrollDown ? windowHeight : 0 );

            var _scrollDown = function() {
              scrollTarget += scrollDelta;
              bodyElement.scrollTop( scrollTarget );
            };

            _scrollDown();
            var timerId = setInterval( _scrollDown, scrollInterval );

            bodyElement.mouseenter( function() {
              clearInterval( timerId );
              bodyElement.off( 'mouseenter' );
            } );
          } );
        }
      } else { // if we are in selecting mode
        bodyElement.off( 'mouseleave' );
        bodyElement.off( 'mouseenter' );
        if ( purpose === 'selecting' ) {
          plugin.$el.find( '.time-slot' ).filter( '[data-selecting]' ).attr( 'data-selected', 'selected' ).removeAttr( 'data-selecting' );
        } else if ( purpose === 'deselecting' ) {
          plugin.$el.find( '.time-slot' ).filter( '[data-selecting]' ).removeAttr( 'data-selected' ).removeAttr( 'data-selecting' );
        }

        plugin.$el.find( '.time-slot' ).removeAttr( 'data-disabled' );
        plugin.$el.trigger( 'dataChanged', [ plugin.serialize() ] );
        plugin.$selectingStart = null;
      }

      plugin.$el.trigger( purpose + '.artsy.dayScheduleSelector', [ plugin.getSelection(), $( plugin ) ] );
	  plugin.$el.trigger( purpose + '_full.artsy.dayScheduleSelector', [ plugin.getSelection_full(), $( plugin ) ] );
    } );

    this.$el.on( 'mouseover', '.time-slot', function() {
      var $slots, day, start, end, temp;
      var columnDay = $('.schedule-table tr:first-child .time-slot').length;
      if ( plugin.isSelecting() ) { // if we are in selecting mode
        $slots = plugin.$el.find( '.time-slot' );
        day = plugin.$selectingStart.data( 'day' );
        $slots.filter( '[data-selecting]' ).removeAttr( 'data-selecting' );
        start = $slots.index( plugin.$selectingStart );
        end = $slots.index( this );
        var startDayNumb = parseInt( plugin.$selectingStart.attr('data-day') );
        var endDayNumb = parseInt( $( this ).attr('data-day') );
        var dayRange = [];
        var diffDayNumb = Math.abs( startDayNumb - endDayNumb );
        var countStart = startDayNumb;
        var countEnd = endDayNumb;
        if (startDayNumb > endDayNumb) {
          countStart = endDayNumb
          countEnd = startDayNumb;
        }
        for ( var i = countStart; i <= countEnd; i++ ) {
          dayRange.push(i);
        }
        dayRange.sort();
        var mousePosition;
        if ( Math.floor( ( start - end ) / columnDay ) + 1 > 0 ) mousePosition = "top";
        else if ( Math.floor( ( start - end ) / columnDay ) + 1 == 0 ) mousePosition = "center";
        else if ( Math.floor( ( start - end ) / columnDay ) + 1 < 0 ) mousePosition = "bottom";

        if ( Math.sign( startDayNumb - endDayNumb ) > 0 ) mousePosition += " left";
        else if ( Math.sign( startDayNumb - endDayNumb ) == 0 ) mousePosition += " center";
        else if ( Math.sign( startDayNumb - endDayNumb ) < 0 ) mousePosition += " right";
        if ( end < 0 ) return; // not hovering on the same column
        if ( start > end ) {
          temp = start;
          start = end;
          end = temp;
        }
        dayRange.forEach( function( day ) {
          switch ( mousePosition ) {
            case "top right":
            case "bottom left":
              $slots.slice( start - diffDayNumb, end + diffDayNumb + 1 ).filter( '[data-day="' + day + '"]' ).attr( 'data-selecting', purpose );
              break;
            default:
              $slots.slice( start, end + 1 ).filter( '[data-day="' + day + '"]' ).attr( 'data-selecting', purpose );
              break;
          }
        } );
      }
    } );
  };

  /**
   * Serialize the selections
   * @public
   * @returns {Object} An object containing the selections of each day, e.g.
   *    {
   *      0: [],
   *      1: [["15:00", "16:30"]],
   *      2: [],
   *      3: [],
   *      5: [["09:00", "12:30"], ["15:00", "16:30"]],
   *      6: []
   *    }
   */
  DayScheduleSelector.prototype.serialize = function() {
	  var plugin = this;
	  var selections = {};

	  $.each( this.options.days, function( _, v ) {
		  var start, end;
		  start = end = false;
		  selections[ v ] = [];
		  plugin.$el.find( ".time-slot[data-day='" + v + "']" ).each( function() {
			  // Start of selection
			  if ( isSlotSelected( $( this ) ) && !start ) {
				  start = $( this ).data( 'time' );
			  }

			  // End of selection (I am not selected, so select until my previous one.)
			  if ( !isSlotSelected( $( this ) ) && !!start ) {
				  end = $( this ).data( 'time' );
			  }

			  // End of selection (I am the last one :) .)
			  if ( isSlotSelected( $( this ) ) && !!start && $( this ).is( $( this ).closest( 'tbody' ).find( ".time-slot[data-day='" + v + "']:last" ) ) ) {
				  end = secondsSinceMidnightToHhmm(
					  hhmmToSecondsSinceMidnight( $( this ).data( 'time' ) ) + plugin.options.interval * 60 );
			  }

			  if ( !!end ) {
				  selections[ v ].push( [ start, end ] );
				  start = end = false;
			  }
		  } );
	  } );
	  return selections;
  };

  /**
   * Deserialize the schedule and render on the UI
   * @public
   * @param {Object} schedule An object containing the schedule of each day, e.g.
   *    {
   *      0: [],
   *      1: [["15:00", "16:30"]],
   *      2: [],
   *      3: [],
   *      5: [["09:00", "12:30"], ["15:00", "16:30"]],
   *      6: []
   *    }
   */
  DayScheduleSelector.prototype.deserialize = function( schedule ) {
    var plugin = this,
      i;
    $.each( schedule, function( d, ds ) {
      var $slots = plugin.$el.find( '.time-slot[data-day="' + d + '"]' );
      $.each( ds, function( _, s ) {
        for ( i = 0; i < $slots.length; i++ ) {
          if ( $slots.eq( i ).data( 'time' ) >= s[ 1 ] ) {
            break;
          }
          if ( $slots.eq( i ).data( 'time' ) >= s[ 0 ] ) {
            plugin.select( $slots.eq( i ) );
          }
        }
      } );
	} );
	console.log(this.getSelection())
	this.$el.trigger( 'selecting.artsy.dayScheduleSelector', [ this.getSelection(), $( this ) ] );
	this.$el.trigger( 'selecting_full.artsy.dayScheduleSelector', [ this.getSelection_full(), $( this ) ] );
	this.$el.trigger( 'dataChanged', [ this.serialize() ] );
  };

  /**
   * Convert a Date object to time in H:mm format with am/pm
   * @private
   * @returns {String} Time in H:mm format with am/pm, e.g. '9:30am'
   */
  DayScheduleSelector.prototype.hmmAmPm = function( date ) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = '';
    if ( this.options.timeFormat != '24' ) {
      hours = hours % 12;
      hours = hours ? hours : 12;
      ampm = hours >= 12 ? 'pm' : 'am';
    }
    return hours + ':' + ( '0' + minutes ).slice( -2 ) + ampm;
  };

  // DayScheduleSelector Plugin Definition
  // =====================================

  function Plugin( option ) {
    return this.each( function() {
      var $this = $( this );
      var data = $this.data( 'artsy.dayScheduleSelector' );
      var options = typeof option == 'object' && option;

      if ( !data ) {
        $this.data( 'artsy.dayScheduleSelector', ( data = new DayScheduleSelector( this, options ) ) );
      }
    } );
  }

  $.fn.dayScheduleSelector = Plugin;

  /**
   * Generate Date objects for each time slot in a day
   * @private
   * @param {String} start Start time in HH:mm format, e.g. "08:00"
   * @param {String} end End time in HH:mm format, e.g. "21:00"
   * @param {Number} interval Interval of each time slot in minutes, e.g. 30 (minutes)
   * @returns {Array} An array of Date objects representing the start time of the time slots
   */
  function generateDates( start, end, interval ) {
    var numOfRows = Math.ceil( timeDiff( start, end ) / interval );
    return $.map( new Array( numOfRows ), function( _, i ) {
      // need a dummy date to utilize the Date object
      return new Date( new Date( 2000, 0, 1, start.split( ':' )[ 0 ], start.split( ':' )[ 1 ] ).getTime() + i * interval * 60000 );
    } );
  }

  /**
   * Return time difference in minutes
   * @private
   */
  function timeDiff( start, end ) { // time in HH:mm format
    // need a dummy date to utilize the Date object
    return ( new Date( 2000, 0, 1, end.split( ':' )[ 0 ], end.split( ':' )[ 1 ] ).getTime() -
      new Date( 2000, 0, 1, start.split( ':' )[ 0 ], start.split( ':' )[ 1 ] ).getTime() ) / 60000;
  }

  /**
   * Convert a Date object to time in HH:mm format
   * @private
   * @returns {String} Time in HH:mm format, e.g. '09:30'
   */
  function hhmm( date ) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return ( '0' + hours ).slice( -2 ) + ':' + ( '0' + minutes ).slice( -2 );
  }

  function hhmmToSecondsSinceMidnight( hhmm ) {
    var h = hhmm.split( ':' )[ 0 ];
    var m = hhmm.split( ':' )[ 1 ];
    return parseInt( h, 10 ) * 60 * 60 + parseInt( m, 10 ) * 60;
  }

  /**
   * Convert seconds since midnight to HH:mm string, and simply
   * ignore the seconds.
   */
  function secondsSinceMidnightToHhmm( seconds ) {
    var minutes = Math.floor( seconds / 60 );
    return ( '0' + Math.floor( minutes / 60 ) ).slice( -2 ) + ':' +
      ( '0' + ( minutes % 60 ) ).slice( -2 );
  }

  // Expose some utility functions
  window.DayScheduleSelector = {
    ssmToHhmm: secondsSinceMidnightToHhmm,
    hhmmToSsm: hhmmToSecondsSinceMidnight
  };

} )( jQuery );
