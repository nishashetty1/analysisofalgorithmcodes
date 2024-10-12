export async function bubbleSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            setInfo(infoId, `Comparing ${arr[j]} with ${arr[j + 1]}`);
            visualizeArray(arr, containerId, n - i, j);
            await nextStep();

            if (arr[j] > arr[j + 1]) {
                setInfo(infoId, `Swapping ${arr[j]} and ${arr[j + 1]}`);
                await animateSwap(arr, j, j + 1, containerId);
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
                await nextStep();
            }
        }

        if (!swapped) {
            setInfo(infoId, `No swaps needed, array is sorted`);
            break;
        }
    }

    setInfo(infoId, `Sorting complete!`);
    visualizeArray(arr, containerId);
}