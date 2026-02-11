const canvas = document.getElementById('canvas');
const personName = document.getElementById('person-name');
const svg = document.getElementById('family-tree');
const addButton = document.getElementById('add-person-btn');
const removeButton = document.getElementById('remove-person-btn');

let nodes = [];
let node_id = 0;

//variables for dragging the person nodes
let isDragging = null;
let currentNode = null;
let offsetX = 0;
let offsetY = 0;


//variable for selecting nodes
let selectedNode = null;



function createNode(name) {
    const x = 10 + (node_id % 5) * 160;
    const y = 10 + Math.floor(node_id / 5) * 100;
    let newFamilyMember = { id: node_id++, name: name, x: x, y: y, connections: [] }

    if (selectedNode) {
        newFamilyMember.connections.push(selectedNode.id)
    }


    nodes.push(newFamilyMember)
}

function renderNodes(nodes) {

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    for (let i = 0; i < nodes.length; i++) {

        const node = nodes[i]
        
        node.connections.forEach(targetNodeId => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            const targetNode = nodes.find(n => n.id === targetNodeId)
            if(!targetNode) return;

            const x1 = node.x + 150 / 2
            const y1 = node.y 
            const x2 = targetNode.x + 150 / 2
            console.log(node);
            const y2 = targetNode.y + 90

            path.setAttribute('d', `M${x1},${y1} L${x2},${y2}`);
            

            path.setAttribute('stroke', 'black');
            path.setAttribute('fill', 'none');

            svg.appendChild(path)
        });

        

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x);
        rect.setAttribute('y', node.y);
        rect.setAttribute('width', '150');
        rect.setAttribute('height', '90');
        rect.setAttribute('fill', '#666');
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

        rect.addEventListener('click', () => {
            selectedNode = node;
            renderNodes(nodes)
        })

        if (node === selectedNode) {
            rect.setAttribute('stroke', 'black')
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
    if (selectedNode) {
        const deletedNode = selectedNode;
        nodes = nodes.filter(n => n.id !== deletedNode.id);
        nodes.forEach(n => {
            n.connections = n.connections.filter(id => id !==deletedNode.id);
        })
        selectedNode = null;
        renderNodes(nodes);

    }
})




