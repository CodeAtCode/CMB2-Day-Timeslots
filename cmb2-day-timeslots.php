<?php

class CMB2_Day_Timeslots {

	public $options = array(
		'opening_hour_label' => 'Opening Hour',
		'closing_hour_label' => 'Closing Hour',
		'weekday_label'  => 'WeekDays',
		'weekday_labels' => array( 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thusday', 'Fridat', 'Saturday' ),
		'minute_interval_label' => 'Minute Interval',
		'interval' => 30,
		'time_format' => '24'
	);

	public function __construct() {
		add_filter( 'cmb2_render_day_timeslots', array( $this, 'cmb_day_timeslots_render' ), 10, 5 );
	}

	// Render boxes
	public function cmb_day_timeslots_render( $field, $value, $object_id, $object_type, $field_type ) {
		$this->cmb_day_timeslots_enqueue();
		$options = array_merge( $this->options, $field->args['options'] );
		echo $field_type->textarea( array(
			'class' => 'hidden',
		) );
		?>
		<label for="opening_hours"><b><?php echo $options['opening_hour_label']; ?></b>: </label><input type="text" name="opening_hours" class="small-text" autocomplete="off" value="8:00" /><br>
		<label for="closing_hours"><b><?php echo $options['closing_hour_label']; ?></b>: </label><input type="text" name="closing_hours" class="small-text" autocomplete="off" value="20:00" /><br>
		<label for="minute_interval"><b><?php echo $options['minute_interval_label']; ?></b>: </label><input type="text" name="minute_interval" class="small-text" autocomplete="off" value="30" />
		<h4><?php
			echo $options['weekday_label'];
		?></h4>
		<ul class="cmb2-checkbox-list cmb2-list">
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day1" value="sunday"> <label for="week_day1"><?php echo $options['weekday_labels'][0]; ?></label></li>
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day2" value="monday"> <label for="week_day2"><?php echo $options['weekday_labels'][1]; ?></label></li>
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day3" value="tuesday"> <label for="week_day3"><?php echo $options['weekday_labels'][2]; ?></label></li>
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day4" value="wednesday"> <label for="week_day4"><?php echo $options['weekday_labels'][3]; ?></label></li>
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day5" value="thursday"> <label for="week_day5"><?php echo $options['weekday_labels'][4]; ?></label></li>
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day6" value="friday"> <label for="week_day6"><?php echo $options['weekday_labels'][5]; ?></label></li>
			<li><input type="checkbox" class="cmb2-option" name="week_day[]" id="week_day7" value="saturday"> <label for="week_day7"><?php echo $options['weekday_labels'][6]; ?></label></li>
		</ul>
		<?php echo $field_type->_desc( true ); ?>
		<div id="day-schedule"></div>
		<script>
		jQuery( document ).ready(function() {
			jQuery("#day-schedule").dayScheduleSelector({
				stringDays: [<?php
					foreach( $options['weekday_labels'] as $item ) {
						echo '"' . $item . '",';
					}
				?>],
				interval: <?php echo $options['interval'] ?>,
				timeFormat: <?php echo $options['time_format'] ?>
				/*
				days: [1, 2, 3, 5, 6],
				startTime: '09:50',
				endTime: '21:06'
			*/
			});
			jQuery("#day-schedule").on('selecting.artsy.dayScheduleSelector', function (e, selected) {
				jQuery('#bookable_slots').text(JSON.stringify(selected));
			})
			jQuery("#day-schedule").data('artsy.dayScheduleSelector').deserialize(JSON.parse(jQuery('#bookable_slots').text()));
			//jQuery("#day-schedule").html('')
		});
		</script>
		<?php
	}

	// enque scripts
	public function cmb_day_timeslots_enqueue() {
		wp_enqueue_script( 'cmb_day_timeslots_script', plugin_dir_url( __FILE__ ) . 'index.js', array( 'jquery' ), '1.0.0' );
		wp_enqueue_style( 'cmb_day_timeslots_stype', plugin_dir_url( __FILE__ ) . 'style.css', array(), '1.0.0' );
	}

}

if ( defined('ABSPATH') ) {
	new CMB2_Day_Timeslots();
}
