// Bilgisayarda çalışan test istemcisi: firmware'deki roborock_local.cpp'yi
// POSIX soketle çalıştırır. Kullanım: host_test <port> <1.0|L01> <local_key>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <poll.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <time.h>
#include <unistd.h>

#include <random>

#include "../RobotSupurgeKumanda/roborock_local.h"

class PosixTransport : public rr::Transport {
 public:
  explicit PosixTransport(int port) : port_(port) {}
  bool open() override {
    fd_ = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in a{};
    a.sin_family = AF_INET;
    a.sin_port = htons(port_);
    inet_pton(AF_INET, "127.0.0.1", &a.sin_addr);
    return ::connect(fd_, (sockaddr*)&a, sizeof(a)) == 0;
  }
  void close() override {
    if (fd_ >= 0) ::close(fd_);
    fd_ = -1;
  }
  bool write(const uint8_t* d, size_t n) override { return ::send(fd_, d, n, 0) == (ssize_t)n; }
  int read(uint8_t* b, size_t cap, uint32_t ms) override {
    pollfd p{fd_, POLLIN, 0};
    int r = poll(&p, 1, (int)ms);
    if (r == 0) return 0;
    ssize_t n = recv(fd_, b, cap, 0);
    return n <= 0 ? -1 : (int)n;
  }
  uint32_t millis() override {
    timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (uint32_t)(t.tv_sec * 1000 + t.tv_nsec / 1000000);
  }
  uint32_t random32() override { return rng_(); }
  uint32_t unixTime() override { return (uint32_t)time(nullptr); }

 private:
  int port_;
  int fd_ = -1;
  std::mt19937 rng_{std::random_device{}()};
};

int main(int argc, char** argv) {
  if (argc < 4) return 2;
  char enc[9];
  rr::encodeTimestamp(0x12345678, enc);
  if (strcmp(enc, "67482315") != 0) {  // python Utils.encode_timestamp(0x12345678)
    printf("FAIL encodeTimestamp %s\n", enc);
    return 1;
  }
  PosixTransport t(atoi(argv[1]));
  rr::Client c(t, argv[3]);
  rr::Version pref = strcmp(argv[2], "L01") == 0 ? rr::VL01 : rr::V10;
  if (!c.connect(pref, 1500)) {
    printf("FAIL connect: %s\n", c.lastError());
    return 1;
  }
  printf("connected version=%s\n", c.version() == rr::VL01 ? "L01" : "1.0");
  char out[512];
  if (!c.call("app_segment_clean", "[{\"segments\":[16,18,21]}]", out, sizeof(out))) {
    printf("FAIL call: %s\n", c.lastError());
    return 1;
  }
  printf("response=%s\n", out);
  if (!c.call("app_charge", "[]", out, sizeof(out))) {
    printf("FAIL call2: %s\n", c.lastError());
    return 1;
  }
  printf("response2=%s\n", out);
  c.close();
  return 0;
}
