export async function insertionSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep, animateSwap) {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        setInfo(infoId, `Inserting ${key} into the sorted portion`);
        await nextStep();
        
        while (j >= 0 && arr[j] > key) {
            setInfo(infoId, `Comparing ${arr[j]} with ${key}`);
            visualizeArray(arr, containerId, i, j);
            await nextStep();
            
            setInfo(infoId, `Moving ${arr[j]} to the right`);
            await animateSwap(arr, j, j + 1, containerId);
            arr[j + 1] = arr[j];
            j--;
            await nextStep();
        }
        
        arr[j + 1] = key;
        setInfo(infoId, `Inserted ${key} at position ${j + 1}`);
        visualizeArray(arr, containerId, i);
        await nextStep();
    }
    
    setInfo(infoId, `Sorting complete!`);
    visualizeArray(arr, containerId);
}