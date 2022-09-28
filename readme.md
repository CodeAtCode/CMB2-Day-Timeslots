## CMB2-Day-Timeslots
[![License](https://img.shields.io/badge/License-MIT%20v1-blue.svg)](https://spdx.org/licenses/MIT.html#licenseText)   

Integrates [day-schedule-selector](https://github.com/CodeAtCode/day-schedule-selector)

```
$woo->add_field(
        array(
				'name'    => \__( 'Slots', YOUR_TEXTDOMAIN ),
				'id'      => 'bookable_slots',
				'type'    => 'day_timeslots',
				'options' => array(
					'opening_hour_label'  => \__( 'Opening Hour', YOUR_TEXTDOMAIN ),
					'closing_hour_label'  => \__( 'Closing Hour', YOUR_TEXTDOMAIN ),
					'weekday_label'  => \__( 'WeekDays', YOUR_TEXTDOMAIN ),
					'weekday_labels' => array( \__( 'Sunday', YOUR_TEXTDOMAIN ), __( 'Monday', YOUR_TEXTDOMAIN ), __( 'Tuesday', YOUR_TEXTDOMAIN ), __( 'Wednesday', YOUR_TEXTDOMAIN ), __( 'Thusday', YOUR_TEXTDOMAIN ), __( 'Friday', YOUR_TEXTDOMAIN ), __( 'Saturday', YOUR_TEXTDOMAIN ) ),
					'minute_interval_label' => \__( 'Minute Interval', YOUR_TEXTDOMAIN ),
					'interval' => 30,
					'time_format' => '24'
				)
        )
    );
```
