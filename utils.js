// Linear Interpolation function
function lerp(A,B,T) {
    return A + (B-A)*T;
}

// Segment Intersection function
function getIntersection(A, B, C, D) {
    const ttop = (D.x-C.x)*(A.y-C.y)-(A.x-C.x)*(D.y-C.y);
    const utop = (C.x-A.x)*(B.y-A.y)-(B.x-A.x)*(C.y-A.y);
    const bottom = (B.x-A.x)*(D.y-C.y)-(D.x-C.x)*(B.y-A.y);

    if (bottom != 0){
        const t = ttop/bottom;
        const u = utop/bottom;
        if (t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x: lerp(A.x,B.x,t),
                y: lerp(A.y,B.y,t),
                offset: t
            };
        }
    }
    return null;
}

// to check if there is any intersection b/w two polygons
function polysIntersect(poly1,poly2){
    for(let i=0;i<poly1.length;i++){
        for (j=0;j<poly2.length;j++){
            const touch = getIntersection(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );

            if (touch) return true;
        }
    }
    return false;
}

function getRGBA(value){
    const alpha=Math.abs(value);
    const R=value<0?0:255;
    const G=R;
    const B=value>0?0:255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}

// function to get random color
function getRandomColor(){
    const hue = 290+(550-290)*Math.random();
    return "hsl("+hue+",100%,70%)"
}