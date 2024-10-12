export async function mergeSort(arr, containerId, infoId, visualizeArray, setInfo, nextStep) {
    async function merge(left, right, start) {
        let result = [];
        let leftIndex = 0;
        let rightIndex = 0;
        
        while (leftIndex < left.length && rightIndex < right.length) {
            setInfo(infoId, `Comparing ${left[leftIndex]} with ${right[rightIndex]}`);
            await nextStep();
            
            if (left[leftIndex] < right[rightIndex]) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }
        
        result = result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
        
        for (let i = 0; i < result.length; i++) {
            arr[start + i] = result[i];
            setInfo(infoId, `Placing ${result[i]} at position ${start + i}`);
            visualizeArray(arr, containerId, start + i);
            await nextStep();
        }
    }
    
    async function mergeSortRecursive(start, end) {
        if (start >= end) return;
        
        const middle = Math.floor((start + end) / 2);
        setInfo(infoId, `Splitting array from index ${start} to ${end}`);
        visualizeArray(arr, containerId, start, end);
        await nextStep();
        
        await mergeSortRecursive(start, middle);
        await mergeSortRecursive(middle + 1, end);
        
        await merge(arr.slice(start, middle + 1), arr.slice(middle + 1, end + 1), start);
    }
    
    await mergeSortRecursive(0, arr.length - 1);
    setInfo(infoId, `Sorting complete!`);
    visualizeArray(arr, containerId);
}