import { useRef, useState } from "react";
import previewImg from '../assets/img/image-placeholder.svg';


document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    alert("Right-click is disabled");
});

const Photoedit = () => {
    const fileInputRef = useRef(null);
    const previewImgRef = useRef(null);
    const [activeFilter, setActiveFilter] = useState("brightness");
    const [filterValues, setFilterValues] = useState({
        brightness: 100,
        saturation: 100,
        inversion: 0,
        grayscale: 0,
    });
    const [transformValues, setTransformValues] = useState({
        rotate: 0,
        flipHorizontal: 1,
        flipVertical: 1,
    });

    const loadImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewImg = previewImgRef.current;
        previewImg.src = URL.createObjectURL(file);
        previewImg.onload = () => {
            resetFilter();
        };
    };

    const applyFilter = () => {
        const previewImg = previewImgRef.current;
        const { rotate, flipHorizontal, flipVertical } = transformValues;
        const { brightness, saturation, inversion, grayscale } = filterValues;

        previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
        previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    const handleSliderChange = (e) => {
        const value = e.target.value;
        setFilterValues((prev) => ({
            ...prev,
            [activeFilter]: value,
        }));
        applyFilter();
    };

    const handleTransformChange = (action) => {
        setTransformValues((prev) => {
            const updated = { ...prev };
            if (action === "left") updated.rotate -= 90;
            if (action === "right") updated.rotate += 90;
            if (action === "horizontal") updated.flipHorizontal *= -1;
            if (action === "vertical") updated.flipVertical *= -1;
            return updated;
        });
        applyFilter();
    };

    const resetFilter = () => {
        setFilterValues({
            brightness: 100,
            saturation: 100,
            inversion: 0,
            grayscale: 0,
        });
        setTransformValues({
            rotate: 0,
            flipHorizontal: 1,
            flipVertical: 1,
        });
        setActiveFilter("brightness");
        applyFilter();
    };

    const saveImage = () => {
        const previewImg = previewImgRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = previewImg.naturalWidth;
        canvas.height = previewImg.naturalHeight;

        const { rotate, flipHorizontal, flipVertical } = transformValues;
        const { brightness, saturation, inversion, grayscale } = filterValues;

        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
        ctx.translate(canvas.width / 2, canvas.height / 2);

        if (rotate !== 0) {
            ctx.rotate((rotate * Math.PI) / 180);
        }

        ctx.scale(flipHorizontal, flipVertical);
        ctx.drawImage(
            previewImg,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
        );

        const link = document.createElement("a");
        link.download = "image.jpg";
        link.href = canvas.toDataURL();
        link.click();
    };

    return (

        <div className="bg-dark max-w-full border-2">
            <h2 className="text-4xl text-center font-bold mb-8 text-black">Simple Image Editor</h2>
            <div className="flex flex-wrap lg:flex-nowrap gap-4">
                {/* Editor Panel */}
                <div className="border border-gray-300 rounded p-4 w-full lg:w-1/3">
                    <label className="block text-xl font-medium mb-4">Filters</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {["Brightness", "Saturation", "Inversion", "Grayscale"].map((filter) => (
                            <button
                                key={filter}
                                className={`py-2 px-4 border rounded text-sm font-medium ${activeFilter === filter
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-white text-gray-700 border-gray-300"
                                    }`}
                                onClick={() => handleFilterChange(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4">
                        <p className="text-sm flex justify-between mb-2 text-gray-600">
                            <span>{activeFilter}</span>
                            <span>{filterValues[activeFilter]}%</span>
                        </p>
                        <input
                            type="range"
                            className="w-full"
                            min={activeFilter === "brightness" || activeFilter === "saturation" ? 0 : 0}
                            max={activeFilter === "brightness" || activeFilter === "saturation" ? 200 : 100}
                            value={filterValues[activeFilter]}
                            onChange={handleSliderChange}
                        />
                        
                    </div>
                    <label className="block text-2lg font-medium mt-6 mb-4">Rotate & Flip</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: "left", label: "↺" },
                            { id: "right", label: "↻" },
                            { id: "horizontal", label: "↔" },
                            { id: "vertical", label: "↕" },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                className="py-2 px-4 border rounded text-sm font-medium bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                                onClick={() => handleTransformChange(id)}
                            >
                                {label}
                               
                            </button>
                        ))}
                    </div>
                </div>
                {/* Preview */}
                <div className="flex-grow flex overflow-hidden ml-5 rounded items-center justify-center">
                    <img
                        ref={previewImgRef}
                        src={previewImg}
                        className="max-h-full lg:w-2/3 h-full object-contain"
                        alt="Preview"
                    />
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
                
                <button className="btn btn-active btn-neutral"
                onClick={resetFilter}
                >
                    Reset Filters
                    </button>
                <div className="flex gap-2">
                    
                    <button className="btn btn-active btn-neutral" onClick={() => fileInputRef.current.click()}>Choose Image</button>
                    
                    <button className="btn btn-active btn-secondary" onClick={saveImage}>Save Image</button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={loadImage}
                />
            </div>
        </div>

    );
};

export default Photoedit;
