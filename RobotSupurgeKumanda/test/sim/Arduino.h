// Bilgisayar simülasyonu için en küçük Arduino taklidi (yalnız test amaçlı).
#pragma once
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <stdio.h>
#include <stdarg.h>
#define HIGH 1
#define LOW 0
#define OUTPUT 1
#define INPUT_PULLDOWN 2
#define RTC_DATA_ATTR
void pinMode(int, int);
void digitalWrite(int, int);
int digitalRead(int);
unsigned long millis();
void delay(unsigned long);
uint32_t esp_random();
uint32_t analogReadMilliVolts(int);
void configTime(long, int, const char*, const char*);
struct HwSerial {
  void begin(int) {}
  void println(const char* s) { printf("LOG %s\n", s); }
  int printf(const char* f, ...) {
    va_list a; va_start(a, f); ::printf("LOG "); int n = vprintf(f, a); va_end(a); return n;
  }
  void flush() { fflush(stdout); }
};
extern HwSerial Serial;
