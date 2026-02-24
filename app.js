const canvas = document.getElementById('canvas');
const personName = document.getElementById('person-name');
const svg = document.getElementById('family-tree');
const addButton = document.getElementById('add-person-btn');
const removeButton = document.getElementById('remove-person-btn');
const connectButton = document.getElementById('connect-btn');

let nodes = [];
let relationships = []; // { childIds: [], parentIds: [] }
let node_id = 0;

let isDragging = null;
let currentNode = null;
let offsetX = 0;
let offsetY = 0;

let selectedNodes = [];
let selectedParentNodes = [];

function createNode(name) {
    const x = 10 + (node_id % 5) * 160;
    const y = 10 + Math.floor(node_id / 5) * 100;
    let newFamilyMember = { id: node_id++, name: name, x: x, y: y };
    nodes.push(newFamilyMember);
}

function drawRelationshipPaths(rel) {
    const children = rel.childIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
    const parents = rel.parentIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);

    if (children.length === 0 || parents.length === 0) return;

    
    const parentTops = parents.map(p => ({ x: p.x + 75, y: p.y }));
    const childBottoms = children.map(c => ({ x: c.x + 75, y: c.y + 90 }));

    
    const lowestChildY = Math.max(...childBottoms.map(c => c.y));
    const highestParentY = Math.min(...parentTops.map(p => p.y));
    const junctionY = lowestChildY + (highestParentY - lowestChildY) / 2;

    
    const allX = [...childBottoms.map(c => c.x), ...parentTops.map(p => p.x)];
    const barMinX = Math.min(...allX);
    const barMaxX = Math.max(...allX);

    
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bar.setAttribute('x1', barMinX);
    bar.setAttribute('y1', junctionY);
    bar.setAttribute('x2', barMaxX);
    bar.setAttribute('y2', junctionY);
    bar.setAttribute('stroke', '#8bc34a');
    bar.setAttribute('stroke-width', '2');
    svg.appendChild(bar);

    
    childBottoms.forEach(c => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', c.x);
        line.setAttribute('y1', c.y);
        line.setAttribute('x2', c.x);
        line.setAttribute('y2', junctionY);
        line.setAttribute('stroke', '#8bc34a');
        line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
    });

    
    parentTops.forEach(p => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p.x);
        line.setAttribute('y1', p.y);
        line.setAttribute('x2', p.x);
        line.setAttribute('y2', junctionY);
        line.setAttribute('stroke', '#8bc34a');
        line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
    });
}

function renderNodes(nodes) {
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    
    relationships.forEach(rel => drawRelationshipPaths(rel));

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x);
        rect.setAttribute('y', node.y);
        rect.setAttribute('width', '150');
        rect.setAttribute('height', '90');
        rect.setAttribute('fill', '#2d5a3d');
        rect.setAttribute('rx', 15);
        rect.setAttribute('ry', 15);
        svg.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x + 75);
        text.setAttribute('y', node.y + 45);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#e8f5e9');
        text.textContent = node.name;
        svg.appendChild(text);

        rect.addEventListener('mousedown', e => {
            currentNode = node;
            isDragging = true;
            offsetX = e.clientX - node.x;
            offsetY = e.clientY - node.y;
        });

        rect.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!e.ctrlKey) {
                if (selectedNodes.includes(node)) {
                    selectedNodes = selectedNodes.filter(n => n !== node);
                } else {
                    selectedNodes.push(node);
                }
            }

            if (e.ctrlKey) {
                if (selectedParentNodes.includes(node)) {
                    selectedParentNodes = selectedParentNodes.filter(n => n !== node);
                } else {
                    if (selectedParentNodes.length >= 2) return;
                    selectedParentNodes.push(node);
                }
            }

            renderNodes(nodes);
        });

        if (selectedNodes.includes(node)) {
            rect.setAttribute('stroke', '#8bc34a');
            rect.setAttribute('stroke-width', '3');
        }

        if (selectedParentNodes.includes(node)) {
            rect.setAttribute('stroke', '#d4a574');
            rect.setAttribute('stroke-width', '3');
        }
    }
}

window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    currentNode.x = e.clientX - offsetX;
    currentNode.y = e.clientY - offsetY;
    renderNodes(nodes);
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    currentNode = null;
});

addButton.addEventListener('click', () => {
    if (personName.value.trim()) {
        createNode(personName.value);
        renderNodes(nodes);
        personName.value = '';
    }
});

removeButton.addEventListener('click', () => {
    if (selectedNodes.length > 0) {
        const toDeleteIDs = selectedNodes.map(n => n.id);
        nodes = nodes.filter(n => !toDeleteIDs.includes(n.id));

       
        relationships = relationships
            .map(rel => ({
                childIds: rel.childIds.filter(id => !toDeleteIDs.includes(id)),
                parentIds: rel.parentIds.filter(id => !toDeleteIDs.includes(id))
            }))
            .filter(rel => rel.childIds.length > 0 && rel.parentIds.length > 0);

        selectedNodes = [];
        renderNodes(nodes);
    }
});

connectButton.addEventListener('click', () => {
    if (selectedNodes.length === 0 || selectedParentNodes.length === 0) return;

    const newRel = {
        childIds: selectedNodes.map(n => n.id),
        parentIds: selectedParentNodes.map(n => n.id)
    };
    relationships.push(newRel);

    selectedNodes = [];
    selectedParentNodes = [];
    renderNodes(nodes);
});