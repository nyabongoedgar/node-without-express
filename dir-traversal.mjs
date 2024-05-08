import fs from 'fs';
import path from 'path';

function getDirectoryStructure(dirPath, depth) {
    const result = {};

    // Recursive function to traverse directory
    function traverse(currentPath, currentDepth) {
        if (currentDepth > depth) {
            return;
        }

        const stats = fs.statSync(currentPath);
        const item = {
            name: path.basename(currentPath),
            type: stats.isDirectory()? 'directory' : 'file',
            size: stats.isDirectory()? null : stats.size, // Size is only relevant for files
            path: currentPath // Adding the path property here
        };

        if (stats.isDirectory()) {
            item.children = [];
            const files = fs.readdirSync(currentPath);
            files.forEach(file => {
                const filePath = path.join(currentPath, file);
                traverse(filePath, currentDepth + 1);
                if (result[filePath]) {
                    item.children.push(result[filePath]);
                    delete result[filePath];
                }
            });
        }

        result[currentPath] = item;
    }

    traverse(dirPath, 0);

    // Clear the root result and return its children instead
    return result[dirPath].children;
}


// Example usage:
const directoryPath = '/Users/mc2/Development/node-prep';
const depth = 3; // Specify the depth you want to traverse

const directoryStructure = getDirectoryStructure(directoryPath, depth);
console.log(JSON.stringify(directoryStructure," ", 2));


/** 
Function GET_DIRECTORY_STRUCTURE(dirPath, depth)
    Initialize an empty object called result

    Define a recursive function called TRAVERSE with parameters currentPath and currentDepth
        If currentDepth is greater than depth
            Stop the function execution
        End if

        Get the statistics of the currentPath using fs.statSync
        Create an item object with properties:
            name: The base name of currentPath
            type: 'directory' if currentPath is a directory, 'file' otherwise
            size: The size of the file if it's a file, null otherwise
            path: The full path of the current directory or file

        If currentPath is a directory
            Initialize an empty array called children in the item object
            Read the contents of the directory using fs.readdirSync
            For each file in the directory
                Construct a full file path
                Call TRAVERSE with the full file path and currentDepth + 1
                If the result object contains the full file path
                    Add the corresponding item to the children array of the current directory item
                    Remove the item from the result object
                End if
            End for
        End if

        Add the item to the result object with the currentPath as the key
    End function

    Call TRAVERSE with dirPath and 0 as arguments

    Clear the root entry from the result object and return the children array of the root directory
End function
*/