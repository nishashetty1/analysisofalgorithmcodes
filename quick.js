export async function quickSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap) {
    async function partition(low, high) {
        const pivot = arr[high];
        setInfo(infoId, `Choosing pivot: ${pivot}`);
        visualizeArray(arr, containerId, high);
        await nextStep();
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            setInfo(infoId, `Comparing ${arr[j]} with pivot ${pivot}`);
            visualizeArray(arr, containerId, j, high);
            await nextStep();
            
            if (arr[j] < pivot) {
                i++;
                setInfo(infoId, `Swapping ${arr[i]} and ${arr[j]}`);
                await animateSwap(arr, i, j, containerId);
                [arr[i], arr[j]] = [arr[j], arr[i]];
                await nextStep();
            }
        }
        
        setInfo(infoId, `Placing pivot ${pivot} in its correct position`);
        await animateSwap(arr, i + 1, high, containerId);
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        await nextStep();
        
        return i + 1;
    }
    
    async function quickSortRecursive(low, high) {
        if (low < high) {
            const pi = await partition(low, high);
            
            setInfo(infoId, `Recursively sorting left partition`);
            await quickSortRecursive(low, pi - 1);
            
            setInfo(infoId, `Recursively sorting right partition`);
            await quickSortRecursive(pi + 1, high);
        }
    }
    
    await quickSortRecursive(0, arr.length - 1);
    setInfo(infoId, `Sorting complete!`);
    visualizeArray(arr, containerId);
}