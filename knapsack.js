const elements = {
    itemsInput: document.getElementById('itemsInput'),
    capacityInput: document.getElementById('capacityInput'),
    randomItemsBtn: document.getElementById('randomItemsBtn'),
    algorithmSelect: document.getElementById('algorithmSelect'),
    greedyBtn: document.getElementById('greedyBtn'),
    dpBtn: document.getElementById('dpBtn'),
    resetBtn: document.getElementById('resetBtn'),
    speedControl: document.getElementById('speedControl'),
    speedValue: document.getElementById('speedValue'),
    itemContainer: document.getElementById('itemContainer'),
    infoText: document.getElementById('infoText'),
    dpTableContainer: document.getElementById('dpTableContainer')
};

class KnapsackProblem {
    constructor() {
        this.items = [];
        this.capacity = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.speed = 3;
    }

    generateRandomItems() {
        const count = Math.floor(Math.random() * 5) + 5;
        this.items = Array.from({ length: count }, () => ({
            weight: Math.floor(Math.random() * 30) + 1,
            value: Math.floor(Math.random() * 100) + 1
        }));
        elements.itemsInput.value = this.items.map(item => `${item.weight},${item.value}`).join(';');
        this.capacity = Math.floor(Math.random() * 50) + 50;
        elements.capacityInput.value = this.capacity;
        this.visualizeItems();
    }

    updateSpeed() {
        this.speed = elements.speedControl.value;
        elements.speedValue.textContent = this.speed;
    }

    async dpKnapsack() {
        const n = this.items.length;
        const dp = Array.from({ length: n + 1 }, () => Array(this.capacity + 1).fill(0));
        this.createDPTable(dp);

        for (let i = 1; i <= n; i++) {
            for (let w = 0; w <= this.capacity; w++) {
                if (!this.isRunning) return;
                this.highlightDPCell(i, w);
                await this.delay();
                if (this.items[i - 1].weight <= w) {
                    dp[i][w] = Math.max(
                        this.items[i - 1].value + dp[i - 1][w - this.items[i - 1].weight],
                        dp[i - 1][w]
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
                this.updateDPTable(dp);
                elements.infoText.textContent = `Filling DP table: item ${i}, weight ${w}`;
            }
        }

        const selected = this.backtrackDP(dp);
        this.visualizeItems(-1, selected);
        elements.infoText.textContent = `Total value: ${dp[n][this.capacity]}, Selected items: ${selected.map(i => i + 1).join(', ')}`;
        this.isRunning = false;
    }

    backtrackDP(dp) {
        const selected = [];
        let w = this.capacity;
        for (let i = this.items.length; i > 0 && w > 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                selected.unshift(i - 1);
                w -= this.items[i - 1].weight;
            }
        }
        return selected;
    }

    createDPTable(dp) {
        const table = document.createElement('table');
        const headerRow = table.insertRow();
        headerRow.insertCell();
        for (let w = 0; w <= this.capacity; w++) {
            const th = document.createElement('th');
            th.textContent = w;
            headerRow.appendChild(th);
        }

        for (let i = 0; i <= this.items.length; i++) {
            const row = table.insertRow();
            const th = document.createElement('th');
            th.textContent = i;
            row.appendChild(th);
            for (let w = 0; w <= this.capacity; w++) {
                const cell = row.insertCell();
                cell.textContent = dp[i][w];
            }
        }

        elements.dpTableContainer.innerHTML = '<div class="dp-table"></div>';
        elements.dpTableContainer.querySelector('.dp-table').appendChild(table);
    }

    updateDPTable(dp) {
        const table = elements.dpTableContainer.querySelector('table');
        for (let i = 0; i <= this.items.length; i++) {
            for (let w = 0; w <= this.capacity; w++) {
                table.rows[i + 1].cells[w + 1].textContent = dp[i][w];
            }
        }
    }

    highlightDPCell(i, w) {
        const table = elements.dpTableContainer.querySelector('table');
        const cells = table.getElementsByTagName('td');
        for (let cell of cells) {
            cell.classList.remove('current');
        }
        table.rows[i].cells[w + 1].classList.add('current');
    }

    async greedyKnapsack(isFractional) {
        this.items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
        let totalValue = 0;
        let remainingCapacity = this.capacity;
        const selected = [];

        for (let i = 0; i < this.items.length; i++) {
            this.visualizeItems(i, selected);
            elements.infoText.textContent = `Considering item with value-to-weight ratio: ${(this.items[i].value / this.items[i].weight).toFixed(2)}`;
            await this.delay();

            if (this.items[i].weight <= remainingCapacity) {
                totalValue += this.items[i].value;
                remainingCapacity -= this.items[i].weight;
                selected.push(i);
            } else if (isFractional) {
                const fraction = remainingCapacity / this.items[i].weight;
                totalValue += this.items[i].value * fraction;
                remainingCapacity = 0;
                selected.push(i);
            }

            if (!this.isRunning || remainingCapacity === 0) break;
        }

        this.visualizeItems(-1, selected);
        elements.infoText.textContent = `Total value: ${totalValue.toFixed(2)}, Remaining capacity: ${remainingCapacity}`;
        this.isRunning = false;
    }

    visualizeItems(current = -1, selected = []) {
        elements.itemContainer.innerHTML = '';
        const maxValue = Math.max(...this.items.map(item => item.value));

        this.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            const bar = document.createElement('div');
            bar.className = 'item-bar';
            bar.style.height = `${(item.value / maxValue) * 250}px`;
            const info = document.createElement('div');
            info.className = 'item-info';
            info.textContent = `W: ${item.weight}, V: ${item.value}`;

            itemElement.appendChild(bar);
            itemElement.appendChild(info);
            if (index === current) itemElement.classList.add('current');
            if (selected.includes(index)) itemElement.classList.add('selected');
            elements.itemContainer.appendChild(itemElement);
        });
    }

    parseInput() {
        this.items = elements.itemsInput.value.split(';').map(item => {
            const [weight, value] = item.split(',').map(Number);
            return { weight, value };
        });
        this.capacity = Number(elements.capacityInput.value);
    }

    resetVisualization() {
        this.isRunning = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        this.visualizeItems();
        elements.dpTableContainer.innerHTML = '';
        elements.infoText.textContent = '';
    }

    delay() {
        return new Promise(resolve => {
            this.intervalId = setTimeout(resolve, 3000 - this.speed * 500);
        });
    }

    startVisualization(algorithm) {
        if (this.isRunning) return;
        this.isRunning = true;
        this.parseInput();
        switch (algorithm) {
            case 'greedy':
                this.greedyKnapsack(elements.algorithmSelect.value === 'fractional');
                break;
            case 'dp':
                this.dpKnapsack();
                break;
        }
    }
}

const knapsackProblem = new KnapsackProblem();

// Event listeners
elements.randomItemsBtn.addEventListener('click', () => knapsackProblem.generateRandomItems());
elements.greedyBtn.addEventListener('click', () => knapsackProblem.startVisualization('greedy'));
elements.dpBtn.addEventListener('click', () => knapsackProblem.startVisualization('dp'));
elements.resetBtn.addEventListener('click', () => knapsackProblem.resetVisualization());
elements.speedControl.addEventListener('input', () => knapsackProblem.updateSpeed());

// Initialize with random items
knapsackProblem.generateRandomItems();