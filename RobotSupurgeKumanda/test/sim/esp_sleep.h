#pragma once
#include <stdint.h>
typedef enum { ESP_SLEEP_WAKEUP_UNDEFINED = 0, ESP_SLEEP_WAKEUP_EXT1 = 3 } esp_sleep_wakeup_cause_t;
enum { ESP_PD_DOMAIN_RTC_PERIPH };
enum { ESP_PD_OPTION_ON = 1 };
enum { ESP_EXT1_WAKEUP_ANY_HIGH = 1 };
esp_sleep_wakeup_cause_t esp_sleep_get_wakeup_cause();
uint64_t esp_sleep_get_ext1_wakeup_status();
inline int esp_sleep_pd_config(int, int) { return 0; }
inline int esp_sleep_enable_ext1_wakeup(uint64_t, int) { return 0; }
void esp_deep_sleep_start();
