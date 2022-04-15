export const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export const oneDayMs = 1000 * 60 * 60 * 24;

export const base64encode = (str: string) => Buffer.from(str, 'utf-8').toString('base64');

type DelayedFunction = (index: number) => any;
export const performWithDelay = (func: DelayedFunction, currentIndex: number, loopLimit: number) => {
    setTimeout(function() {
        func(currentIndex);
        if (currentIndex < loopLimit) {
            performWithDelay(func, currentIndex + 1, loopLimit);
        }            
    }, (currentIndex * 1000) + 1000)
}

export const sleep = async (time: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time)
    })
}
