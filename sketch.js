// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleSize = 80; // 圓的寬高
let isDragging = false; // 是否正在拖動圓
let prevX, prevY; // 上一個手指位置
let trailLayer; // 用於繪製軌跡的圖層

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 圓的初始位置設置在畫布中央
  circleX = width / 2;
  circleY = height / 2;

  // 建立一個獨立的圖層來繪製軌跡
  trailLayer = createGraphics(width, height);
  trailLayer.clear(); // 確保圖層是透明的

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 繪製攝影機影像
  image(video, 0, 0);

  // 繪製軌跡圖層
  image(trailLayer, 0, 0);

  // 繪製圓
  fill('#669BBC'); // 修改為藍色 (#669BBC)
  noStroke();
  circle(circleX, circleY, circleSize);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    let fingerX, fingerY;
    let thumbX, thumbY;
    isDragging = false; // 預設為未拖動

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        let keypoints = hand.keypoints;

        // 繪製食指 (keypoints[8])
        if (keypoints.length >= 9) {
          let indexFinger = keypoints[8];
          fingerX = indexFinger.x;
          fingerY = indexFinger.y;

          // 根據左手或右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255); // 左手顏色
          } else {
            fill(255, 255, 0); // 右手顏色
          }

          noStroke();
          circle(fingerX, fingerY, 16);

          // 檢查食指是否接觸圓
          let distance = dist(fingerX, fingerY, circleX, circleY);
          if (distance < circleSize / 2) {
            isDragging = true;

            // 如果有上一個位置，畫出食指的軌跡
            if (prevX !== undefined && prevY !== undefined) {
              trailLayer.stroke('#FFAFCC'); // 食指軌跡顏色
              trailLayer.strokeWeight(10); // 軌跡粗細
              trailLayer.line(prevX, prevY, fingerX, fingerY);
            }

            // 更新圓的位置
            circleX = fingerX;
            circleY = fingerY;

            // 更新上一個位置
            prevX = fingerX;
            prevY = fingerY;
          }
        }

        // 繪製大拇指 (keypoints[4])
        if (keypoints.length >= 5) {
          let thumb = keypoints[4];
          thumbX = thumb.x;
          thumbY = thumb.y;

          // 檢查大拇指是否接觸圓
          let thumbDistance = dist(thumbX, thumbY, circleX, circleY);
          if (thumbDistance < circleSize / 2) {
            isDragging = true;

            // 如果有上一個位置，畫出大拇指的軌跡
            if (prevX !== undefined && prevY !== undefined) {
              trailLayer.stroke('#CDB4DB'); // 大拇指軌跡顏色
              trailLayer.strokeWeight(10); // 軌跡粗細
              trailLayer.line(prevX, prevY, thumbX, thumbY);
            }

            // 更新圓的位置
            circleX = thumbX;
            circleY = thumbY;

            // 更新上一個位置
            prevX = thumbX;
            prevY = thumbY;
          }
        }
      }
    }

    // 如果手指未接觸圓，清除上一個位置
    if (!isDragging) {
      prevX = undefined;
      prevY = undefined;
    }
  }
}
