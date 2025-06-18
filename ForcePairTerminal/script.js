document.addEventListener('DOMContentLoaded', function () {
    // Generate a 10-digit random number
    let RandNo = '';
    for (let i = 0; i < 10; i++) {
      RandNo += Math.floor(Math.random() * 10);
    }
  
    // Calculate the sum of individual digits
    let RandTotal = RandNo.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
    // Get the progress meter and text elements
    const progressMeter = document.getElementById('progressMeter');
    const progressText = document.getElementById('progressText');
  
    // Calculate the duration for the progress meter animation
    const duration = RandTotal * 1000; // RandTotal seconds converted to milliseconds
  
    // Animate the progress meter
    let startTime = null;
    function animateMeter(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = elapsedTime / duration;
      progressMeter.value = progress * 100;
      progressText.textContent = `${Math.round(progress * 100)}%`;
      if (progress < 1) {
        requestAnimationFrame(animateMeter);
      } else {
        // Animation completed, wait for 2 seconds before redirecting
        setTimeout(() => {
          if (RandTotal % 2 === 0) {
            // RandTotal is even, redirect to fail.html
            window.location.href = 'fail.html';
          } else {
            // RandTotal is odd, redirect to pass.html
            window.location.href = 'pass.html';
          }
        }, 2000); // 2000 milliseconds = 2 seconds
      }
    }
    requestAnimationFrame(animateMeter);
  });
  