const canvas = document.getElementById('canvas');
const personName = document.getElementById('person-name');
const svg = document.getElementById('family-tree');
const addButton = document.getElementById('add-person-btn');
const removeButton = document.getElementById('remove-person-btn');
const connectButton = document.getElementById('connect-btn');

let nodes = [];
let node_id = 0;

//variables for dragging the person nodes
let isDragging = null;
let currentNode = null;
let offsetX = 0;
let offsetY = 0;



let selectedNodes = [];
let selectedParentNodes = [];



function createNode(name) {
    const x = 10 + (node_id % 5) * 160;
    const y = 10 + Math.floor(node_id / 5) * 100;
    let newFamilyMember = { id: node_id++, name: name, x: x, y: y, connections: [] };


    nodes.push(newFamilyMember)
}

function createConnectionPath(child, parent) {
    const startX = child.x + 75; // child bottom center
    const startY = child.y + 90;
    const endX = parent.x + 75; // parent top center
    const endY = parent.y;

    const midY = startY + 20;
    const midX = endX;

    const pathData = `M ${startX},${startY} 
                      V ${midY} 
                      H ${midX} 
                      V ${endY}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'black');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');

    return path;
}

function renderNodes(nodes) {

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    for (let i = 0; i < nodes.length; i++) {

        const node = nodes[i];

        node.connections.forEach(parentId => {
            const parentNode = nodes.find(n => n.id === parentId);
            if (parentNode) {
                const path = createConnectionPath(node, parentNode);
                svg.appendChild(path);
            }
        });
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x);
        rect.setAttribute('y', node.y);
        rect.setAttribute('width', '150');
        rect.setAttribute('height', '90');
        rect.setAttribute('fill', '#667eea');
        rect.setAttribute('rx', 15)
        rect.setAttribute('ry', 15)
        svg.appendChild(rect)

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x + 75);
        text.setAttribute('y', node.y + 45);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.textContent = node.name;
        svg.appendChild(text)


        rect.addEventListener('mousedown', e => {
            console.log(node);
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
                    if (selectedParentNodes.length >= 2) {
                        return; 
                    }
                    selectedParentNodes.push(node);

                }
            }

            renderNodes(nodes);
        });

        if (selectedNodes.includes(node)) {
            rect.setAttribute('stroke', 'black');
            rect.setAttribute('stroke-width', '2')
        }

        if (selectedParentNodes.includes(node)) {
            rect.setAttribute('stroke', 'red');
            rect.setAttribute('stroke-width', '2')
        }

    }

}

window.addEventListener('mousemove', e => {
    if (!isDragging) {
        return;
    }
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
        createNode(personName.value)
        renderNodes(nodes);
        personName.value = '';
        //console.log(nodes);
    }
});



removeButton.addEventListener('click', () => {
    if (selectedNodes.length > 0) {
        const toDeleteIDs = selectedNodes.map(n => n.id)
        nodes = nodes.filter(n => !toDeleteIDs.includes(n.id));
        nodes.forEach(n => {
            n.connections = n.connections.filter(id => !toDeleteIDs.includes(id));
        })
        selectedNodes = [];
        renderNodes(nodes);

    }
});

connectButton.addEventListener('click', () => {

    selectedNodes.forEach(child => {
        selectedParentNodes.forEach(parent => {

            if (!child.connections.includes(parent.id)) {
                child.connections.push(parent.id);
            }
        });
    });

    renderNodes(nodes);
});




