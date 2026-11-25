#pragma once
typedef enum { GPIO_NUM_0 } gpio_num_t;
enum { RTC_GPIO_MODE_INPUT_ONLY };
inline int rtc_gpio_deinit(gpio_num_t) { return 0; }
inline int rtc_gpio_init(gpio_num_t) { return 0; }
inline int rtc_gpio_set_direction(gpio_num_t, int) { return 0; }
inline int rtc_gpio_pullup_dis(gpio_num_t) { return 0; }
inline int rtc_gpio_pulldown_en(gpio_num_t) { return 0; }
