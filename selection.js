export async function selectionSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        setInfo(infoId, `Finding minimum from index ${i} to ${n-1}`);
        visualizeArray(arr, containerId, i, minIdx);
        await nextStep();

        for (let j = i + 1; j < n; j++) {
            setInfo(infoId, `Comparing ${arr[minIdx]} with ${arr[j]}`);
            visualizeArray(arr, containerId, i, j);
            await nextStep();

            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                setInfo(infoId, `New minimum found: ${arr[minIdx]}`);
                visualizeArray(arr, containerId, i, minIdx);
                await nextStep();
            }
        }

        if (minIdx !== i) {
            setInfo(infoId, `Swapping ${arr[i]} and ${arr[minIdx]}`);
            await animateSwap(arr, i, minIdx, containerId);
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            await nextStep();
        }

        visualizeArray(arr, containerId, i + 1);
        await nextStep();
    }

    setInfo(infoId, `Sorting complete!`);
    visualizeArray(arr, containerId);
}