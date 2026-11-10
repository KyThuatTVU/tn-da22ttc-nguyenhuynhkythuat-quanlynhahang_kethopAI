/* ==== Script 1 (tách từ apriori-rules.html) ==== */
let allRules = [];
        let filteredRules = [];

        // Load rules on page load
        window.addEventListener('DOMContentLoaded', () => {
            loadRules();
            
            // Event listeners cho filters
            document.getElementById('search-input').addEventListener('input', filterRules);
            document.getElementById('confidence-slider').addEventListener('input', filterRules);
            document.getElementById('sort-select').addEventListener('change', filterRules);
        });

        async function loadRules() {
            try {
                const response = await fetch('http://localhost:5000/api/ml/apriori/rules');
                const result = await response.json();

                if (!result.success) {
                    showEmptyState(result.message);
                    return;
                }

                allRules = result.data;
                filteredRules = [...allRules];

                // Update stats
                document.getElementById('total-rules').textContent = result.meta.total_rules.toLocaleString();
                document.getElementById('total-antecedents').textContent = result.meta.total_antecedents.toLocaleString();
                document.getElementById('avg-confidence').textContent = (result.meta.avg_confidence * 100).toFixed(1) + '%';

                renderRules();
            } catch (error) {
                console.error('Error loading rules:', error);
                showEmptyState('Lỗi kết nối đến AI Service');
            }
        }

        function filterRules() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const minConfidence = parseInt(document.getElementById('confidence-slider').value) / 100;
            const sortBy = document.getElementById('sort-select').value;

            // Filter
            filteredRules = allRules.filter(rule => {
                const matchesSearch = rule.antecedent.name.toLowerCase().includes(searchTerm) ||
                                    rule.consequent.name.toLowerCase().includes(searchTerm);
                const matchesConfidence = rule.confidence >= minConfidence;
                return matchesSearch && matchesConfidence;
            });

            // Sort
            filteredRules.sort((a, b) => {
                if (sortBy === 'confidence') return b.confidence - a.confidence;
                if (sortBy === 'lift') return b.lift - a.lift;
                if (sortBy === 'antecedent') return a.antecedent.name.localeCompare(b.antecedent.name);
            });

            renderRules();
        }

        function renderRules() {
            const container = document.getElementById('rules-container');
            const emptyState = document.getElementById('empty-state');

            if (filteredRules.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');

            container.innerHTML = filteredRules.map(rule => {
                // Xử lý đường dẫn ảnh cho antecedent
                let antImg = rule.antecedent.image || 'default-food.jpg';
                if (!antImg.startsWith('http') && !antImg.startsWith('/images/')) {
                    antImg = '/images/' + antImg.replace(/^\/+/, '');
                }
                const antImgUrl = antImg.startsWith('http') ? antImg : `http://localhost:3000${antImg}`;

                // Xử lý đường dẫn ảnh cho consequent
                let consImg = rule.consequent.image || 'default-food.jpg';
                if (!consImg.startsWith('http') && !consImg.startsWith('/images/')) {
                    consImg = '/images/' + consImg.replace(/^\/+/, '');
                }
                const consImgUrl = consImg.startsWith('http') ? consImg : `http://localhost:3000${consImg}`;

                return `
                    <div class="rule-card bg-white rounded-lg shadow p-6">
                        <div class="flex items-start gap-6">
                            <!-- Antecedent (Món gốc) -->
                            <div class="flex-1">
                                <div class="flex items-center gap-4">
                                    <img src="${antImgUrl}" 
                                         alt="${rule.antecedent.name}"
                                         class="w-20 h-20 object-cover rounded-lg"
                                         onerror="this.src='../images/default-food.jpg'">
                                    <div class="flex-1">
                                        <h3 class="font-semibold text-gray-900 mb-1">${rule.antecedent.name}</h3>
                                        <p class="text-sm text-gray-500">${new Intl.NumberFormat('vi-VN').format(rule.antecedent.price)} đ</p>
                                    </div>
                                </div>
                            </div>
    
                            <!-- Arrow -->
                            <div class="flex items-center justify-center">
                                <div class="bg-orange-100 rounded-full p-3">
                                    <i class="fas fa-arrow-right text-orange-600 text-xl"></i>
                                </div>
                            </div>
    
                            <!-- Consequent (Món được gợi ý) -->
                            <div class="flex-1">
                                <div class="flex items-center gap-4">
                                    <img src="${consImgUrl}" 
                                         alt="${rule.consequent.name}"
                                         class="w-20 h-20 object-cover rounded-lg"
                                         onerror="this.src='../images/default-food.jpg'">
                                    <div class="flex-1">
                                        <h3 class="font-semibold text-gray-900 mb-1">${rule.consequent.name}</h3>
                                        <p class="text-sm text-gray-500">${new Intl.NumberFormat('vi-VN').format(rule.consequent.price)} đ</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Metrics -->
                            <div class="w-48">
                                <div class="mb-3">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-sm text-gray-600">Confidence:</span>
                                        <span class="text-sm font-semibold text-gray-900">${(rule.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="confidence-bar rounded-full h-2" style="width: ${rule.confidence * 100}%"></div>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-600">Lift:</span>
                                    <span class="font-semibold ${rule.lift > 1 ? 'text-green-600' : 'text-gray-600'}">${rule.lift.toFixed(2)}x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function showEmptyState(message) {
            document.getElementById('rules-container').innerHTML = '';
            const emptyState = document.getElementById('empty-state');
            emptyState.classList.remove('hidden');
            emptyState.querySelector('p').textContent = message;
        }

        function toggleView(viewType) {
            const networkView = document.getElementById('network-view');
            const rulesContainer = document.getElementById('rules-container');
            const btnNetwork = document.getElementById('btn-network');
            const btnList = document.getElementById('btn-list');

            if (viewType === 'network') {
                networkView.classList.remove('hidden');
                rulesContainer.classList.add('hidden');
                btnNetwork.classList.add('bg-blue-700');
                btnNetwork.classList.remove('bg-blue-600');
                btnList.classList.remove('bg-gray-700');
                btnList.classList.add('bg-gray-600');
                
                // Render network graph
                renderNetworkGraph();
            } else {
                networkView.classList.add('hidden');
                rulesContainer.classList.remove('hidden');
                btnList.classList.add('bg-gray-700');
                btnList.classList.remove('bg-gray-600');
                btnNetwork.classList.remove('bg-blue-700');
                btnNetwork.classList.add('bg-blue-600');
            }
        }

        function renderNetworkGraph() {
            if (filteredRules.length === 0) return;

            const container = document.getElementById('network-graph');
            
            // Prepare nodes and edges
            const nodesMap = new Map();
            const edges = [];

            filteredRules.forEach((rule, index) => {
                // Add antecedent node
                if (!nodesMap.has(rule.antecedent.id)) {
                    nodesMap.set(rule.antecedent.id, {
                        id: rule.antecedent.id,
                        label: rule.antecedent.name,
                        title: `${rule.antecedent.name}\n${new Intl.NumberFormat('vi-VN').format(rule.antecedent.price)} đ`,
                        shape: 'box',
                        color: {
                            background: '#FFF7ED',
                            border: '#EA580C',
                            highlight: { background: '#FFEDD5', border: '#C2410C' }
                        },
                        font: { size: 14, face: 'Arial' }
                    });
                }

                // Add consequent node
                if (!nodesMap.has(rule.consequent.id)) {
                    nodesMap.set(rule.consequent.id, {
                        id: rule.consequent.id,
                        label: rule.consequent.name,
                        title: `${rule.consequent.name}\n${new Intl.NumberFormat('vi-VN').format(rule.consequent.price)} đ`,
                        shape: 'box',
                        color: {
                            background: '#EFF6FF',
                            border: '#2563EB',
                            highlight: { background: '#DBEAFE', border: '#1D4ED8' }
                        },
                        font: { size: 14, face: 'Arial' }
                    });
                }

                // Add edge (arrow from antecedent to consequent)
                const edgeWidth = 1 + (rule.confidence * 5); // Width based on confidence
                
                // Color based on lift strength
                let edgeColor = '#EF4444'; // Red (weak)
                if (rule.lift >= 2.0) {
                    edgeColor = '#22C55E'; // Green (strong)
                } else if (rule.lift >= 1.0) {
                    edgeColor = '#EAB308'; // Yellow (medium)
                }

                edges.push({
                    from: rule.antecedent.id,
                    to: rule.consequent.id,
                    arrows: 'to',
                    width: edgeWidth,
                    color: { color: edgeColor, highlight: edgeColor },
                    title: `Confidence: ${(rule.confidence * 100).toFixed(1)}%\nLift: ${rule.lift.toFixed(2)}x`,
                    smooth: { type: 'curvedCW', roundness: 0.2 }
                });
            });

            const nodes = new vis.DataSet(Array.from(nodesMap.values()));
            const edgesDataSet = new vis.DataSet(edges);

            const data = { nodes, edges: edgesDataSet };
            
            const options = {
                nodes: {
                    borderWidth: 2,
                    borderWidthSelected: 3,
                    font: { color: '#374151' }
                },
                edges: {
                    arrows: {
                        to: { enabled: true, scaleFactor: 1.2 }
                    },
                    smooth: { type: 'curvedCW' }
                },
                physics: {
                    enabled: true,
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: {
                        gravitationalConstant: -50,
                        centralGravity: 0.01,
                        springLength: 150,
                        springConstant: 0.08,
                        damping: 0.4,
                        avoidOverlap: 1
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 200,
                        updateInterval: 25
                    }
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 100,
                    navigationButtons: true,
                    keyboard: true
                },
                layout: {
                    improvedLayout: true,
                    hierarchical: false
                }
            };

            // Destroy previous network if exists
            if (window.networkInstance) {
                window.networkInstance.destroy();
            }

            // Create new network
            window.networkInstance = new vis.Network(container, data, options);

            // Stop physics after stabilization for better performance
            window.networkInstance.on('stabilizationIterationsDone', function() {
                window.networkInstance.setOptions({ physics: false });
            });
        }

        async function retrainModel() {
            if (!confirm('Bạn có chắc muốn train lại model Apriori? Quá trình này có thể mất vài phút.')) {
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/ml/train', {
                    method: 'POST'
                });
                const result = await response.json();

                if (result.success) {
                    alert('Train model thành công! Đang tải lại dữ liệu...');
                    location.reload();
                } else {
                    alert('Lỗi: ' + result.message);
                }
            } catch (error) {
                alert('Lỗi kết nối: ' + error.message);
            }
        }
