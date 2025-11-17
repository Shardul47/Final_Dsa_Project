#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_VIDEOS 10
#define SKIP_INTERVAL 5
#define MAX_USERS 50
#define CRED_FILE "credentials.dat"

typedef struct {
  char path_or_id[100];
  char title[100];
  int is_mp4;
} Video;

typedef struct {
  Video videos[MAX_VIDEOS];
  int top;
} VideoStack;

typedef struct {
  char username[50];
  char password[50];
} User;

void push(VideoStack *stack, Video video) {
  if (stack->top >= MAX_VIDEOS - 1) {
    printf("Stack overflow: Cannot push \"%s\"\n", video.title);
    return;
  }
  stack->videos[++(stack->top)] = video;
  printf("Pushed: \"%s\"\n", video.title);
}

Video pop(VideoStack *stack) {
  Video empty = {"", "", 0};
  if (stack->top < 0) {
    printf("Stack underflow: Cannot pop from empty stack\n");
    return empty;
  }
  Video video = stack->videos[(stack->top)--];
  printf("Popped: \"%s\"\n", video.title);
  return video;
}

Video peek(VideoStack *stack) {
  Video empty = {"", "", 0};
  if (stack->top < 0) return empty;
  return stack->videos[stack->top];
}

void traverse(VideoStack *stack) {
  if (stack->top < 0) {
    printf("Stack is empty\n");
    return;
  }
  printf("Stack Contents (Top to Bottom):\n");
  for (int i = stack->top; i >= 0; --i) {
    Video v = stack->videos[i];
    if (v.is_mp4)
      printf(" - %s (Local MP4: %s)\n", v.title, v.path_or_id);
    else
      printf(" - %s (YouTube ID: %s)\n", v.title, v.path_or_id);
  }
}

void playAndSkip(VideoStack *stack) {
  if (stack->top < 0) {
    printf("No video to play\n");
    return;
  }

  int i = stack->top;
  while (1) { // Loop forever through the stack
    Video current = stack->videos[i];
    printf("\nPlaying: %s\n", current.title);
    if (current.is_mp4)
      printf("Source: %s (Local MP4 File)\n", current.path_or_id);
    else
      printf("YouTube ID: %s\n", current.path_or_id);

    int currentTime = 0;
    while (currentTime < 25) { // play up to 25 seconds max for demo
      printf("Time: %ds - %s\n", currentTime, current.title);
      currentTime += SKIP_INTERVAL;
      sleep(1);
      printf("Skipped %d seconds!\n", SKIP_INTERVAL);
    }
    printf("Finished playing: %s\n", current.title);

    i--;
    if (i < 0) i = stack->top; // circle back to top (loop)
  }
}

// --- User credential storage ---

int saveUserCredential(User user) {
  FILE *fp = fopen(CRED_FILE, "ab");
  if (!fp) {
    perror("Error opening credential file");
    return 0;
  }
  fwrite(&user, sizeof(User), 1, fp);
  fclose(fp);
  return 1;
}

// Check if user exists and password matches
int validateUser(char *username, char *password) {
  FILE *fp = fopen(CRED_FILE, "rb");
  if (!fp) return 0; // no credentials file means no users stored
  User user;
  while (fread(&user, sizeof(User), 1, fp)) {
    if (strcmp(user.username, username) == 0 && strcmp(user.password, password) == 0) {
      fclose(fp);
      return 1; // user validated
    }
  }
  fclose(fp);
  return 0; // no matching user
}

// Check if username already exists
int userExists(char *username) {
  FILE *fp = fopen(CRED_FILE, "rb");
  if (!fp) return 0;
  User user;
  while (fread(&user, sizeof(User), 1, fp)) {
    if (strcmp(user.username, username) == 0) {
      fclose(fp);
      return 1;
    }
  }
  fclose(fp);
  return 0;
}

int main() {
  Video videos[] = {

    {"xuP4g7IDgDM", "Beautiful sunset", 0},
    {"nqye02H_H6I", "River video", 0},
    {"9iDXWx7GtZQ", "Soothing nature", 0},
    {"NSAOrGb9orM", "Beautiful landscape", 0},
    {"-oOoTIuoL8M", "Mountain", 0}
  };

  int sampleCount = sizeof(videos)/sizeof(videos[0]);

  VideoStack stack;
  stack.top = -1;

  // Add videos to stack
  for (int i = 0; i < sampleCount; ++i) {
    push(&stack, videos[i]);
  }

  traverse(&stack);

  // Play videos skipping every 5 seconds in an infinite loop
  playAndSkip(&stack);

  return 0;
}
