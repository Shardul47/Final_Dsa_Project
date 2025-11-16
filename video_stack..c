#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_VIDEOS 10
#define SKIP_INTERVAL 5

typedef struct {
    char path_or_id[100]; 
    char title[100];
    int is_mp4;           
} Video;

typedef struct {
    Video videos[MAX_VIDEOS];
    int top;
} VideoStack;

void push(VideoStack *stack, Video video) {
    if (stack->top >= MAX_VIDEOS - 1) {
        printf("Stack overflow: Cannot push \"%s\"\n", video.title);
        return;
    }
    stack->videos[++(stack->top)] = video;
    printf("Pushed: \"%s\"\n", video.title);
}

Video pop(VideoStack *stack) {
    if (stack->top < 0) {
        printf("Stack underflow: Cannot pop from empty stack\n");
        Video empty = {"", "", 0};
        return empty;
    }
    Video video = stack->videos[(stack->top)--];
    printf("Popped: \"%s\"\n", video.title);
    return video;
}

Video peek(VideoStack *stack) {
    if (stack->top < 0) {
        Video empty = {"", "", 0};
        return empty;
    }
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
    Video current = stack->videos[stack->top];
    int duration = 25;
    int currentTime = 0;
    printf("\nPlaying: %s\n", current.title);
    if (current.is_mp4) {
        printf("Source: %s (Local MP4 File)\n", current.path_or_id);
    } else {
        printf("YouTube ID: %s\n", current.path_or_id);
    }
    while (currentTime < duration) {
        printf("Time: %ds - %s\n", currentTime, current.title);
        currentTime += SKIP_INTERVAL;
        sleep(1);
        printf("Skipped %d seconds!\n", SKIP_INTERVAL);
    }
    printf("Finished playing: %s\n\n", current.title);
}

int main() {
    Video videos[] = {
        {"dQw4w9WgXcQ", "Never Gonna Give You Up", 0},
        {"xuP4g7IDgDM", "Beautiful sunset", 0},
        {"nqye02H_H6I", "River video", 0},
        {"9iDXWx7GtZQ", "Soothing nature", 0},
        {"NSAOrGb9orM", "Beautiful landscape", 0},
        {"-oOoTIuoL8M", "Mountain", 0}


    };
    int sampleCount = sizeof(videos)/sizeof(videos[0]);

    VideoStack stack;
    stack.top = -1;

    push(&stack, videos[0]);
    playAndSkip(&stack);

    for (int i = 1; i < sampleCount; ++i) {
        push(&stack, videos[i]);
    }
    traverse(&stack);

    pop(&stack);
    traverse(&stack);

    return 0;
}
