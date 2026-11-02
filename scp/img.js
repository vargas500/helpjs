function workerBomb() {
    console.log("Starting workerBomb (1.5x)...");
    const script = `
        let counter = 0;
        while (true) {
            counter++;
            Math.random() * Math.random();
            Math.random() * Math.random();
            if (counter % 1e6 === 0) {
                postMessage({ status: "working", counter });
            }
        }
    `;
    const blob = new Blob([script], { type: "application/javascript" });
    const workerURL = URL.createObjectURL(blob);
    for (let i = 0; i < 20; i++) {          // 13 -> 20
        try {
            const worker = new Worker(workerURL);
            worker.onerror = (error) => console.error("Worker error:", error);
        } catch(e) {
            console.log("Worker limit reached at", i);
            break;
        }
    }
}

// ... rest of code unchanged ...

        repeatBombTimer = setInterval(workerBomb, 20000);  // 30s -> 20s
