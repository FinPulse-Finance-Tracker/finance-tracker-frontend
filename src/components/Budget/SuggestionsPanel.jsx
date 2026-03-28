import React, { useState, useEffect, useRef } from 'react';
import {
    X, MapPin, TrendingDown, Sparkles, Loader2,
    Search, Map, Keyboard, Navigation, CheckCircle2, Star, ExternalLink
} from 'lucide-react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

// ── Google Maps Autocomplete input ──────────────────────────────────────────
function GooglePlacePicker({ onPlaceSelected, isLoaded, loadError }) {
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);
    const [inputVal, setInputVal] = useState('');
    const [pickedPlace, setPickedPlace] = useState('');

    const handlePlaceChanged = () => {
        if (!autocompleteRef.current) return;
        const place = autocompleteRef.current.getPlace();
        const name = place?.name || place?.formatted_address || '';
        setPickedPlace(name);
        setInputVal(name);
        onPlaceSelected(name);
    };

    if (!MAPS_API_KEY) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                    <Map size={24} />
                </div>
                <p className="text-sm text-zinc-400 text-center">
                    Google Maps API key not configured.
                </p>
                <p className="text-xs text-zinc-600 text-center max-w-xs">
                    Add <span className="text-purple-400 font-mono">VITE_GOOGLE_MAPS_API_KEY</span> to your <span className="font-mono">.env</span> file to enable map-based location picking.
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <p className="text-sm text-red-400 py-6 text-center">Failed to load Google Maps</p>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Autocomplete
                onLoad={(ref) => (autocompleteRef.current = ref)}
                onPlaceChanged={handlePlaceChanged}
            >
                <div className="relative">
                    <Map size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for a city, area or landmark…"
                        value={inputVal}
                        onChange={(e) => {
                            setInputVal(e.target.value);
                            if (!e.target.value) {
                                setPickedPlace('');
                                onPlaceSelected('');
                            }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </Autocomplete>

            {pickedPlace ? (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Location picked: <span className="font-semibold">{pickedPlace}</span></span>
                </div>
            ) : (
                <p className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                    <Navigation size={11} className="text-zinc-500" />
                    Start typing and select a suggestion from the dropdown
                </p>
            )}
        </div>
    );
}

// ── Main Panel ───────────────────────────────────────────────────────────────
export default function SuggestionsPanel({ isOpen, onClose, budget }) {
    // Load Google Maps script at the top level so window.google is always available
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'map'
    const [manualInput, setManualInput] = useState('');
    const [mapLocation, setMapLocation] = useState('');
    const [activeLocation, setActiveLocation] = useState('');
    
    // Shopping type state
    const [shoppingType, setShoppingType] = useState(''); // e.g., 'clothing', 'jewelry', 'flowers', 'shoes', 'house things', 'groceries'
    const [customShoppingType, setCustomShoppingType] = useState('');
    const [activeShoppingType, setActiveShoppingType] = useState('');

    // Reset on open / budget change
    useEffect(() => {
        if (isOpen) {
            setActiveTab('manual');
            setManualInput('');
            setMapLocation('');
            setActiveLocation('');
            setShoppingType('');
            setCustomShoppingType('');
            setActiveShoppingType('');
        }
    }, [isOpen, budget?.categoryId]);

    const finalShoppingType = shoppingType === 'other' ? customShoppingType.trim() : shoppingType;

    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hidden map ref required for PlacesService
    const mapRef = useRef(null);

    // Effect to fetch Google Places when activeLocation or activeShoppingType changes
    useEffect(() => {
        if (!isOpen || !activeLocation || !budget?.categoryId || !isLoaded || !window.google) return;

        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            // Need a map instance or a dummy div for PlacesService
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 6.9271, lng: 79.8612 }, // Colombo default
                zoom: 15,
            });

            const service = new window.google.maps.places.PlacesService(map);
            
            // Construct the search query
            const typePhrase = activeShoppingType ? activeShoppingType : (budget?.category?.name || 'shops');
            const query = `${typePhrase} near ${activeLocation}`; // changed "in" to "near" for better map searching

            console.log('Sending Google Places TextSearch:', query);

            service.textSearch({ query }, (results, status) => {
                setIsLoading(false);
                console.log('Google Places response status:', status, results);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    // Sort by rating internally just to give best first (limit to 6)
                    const sorted = results
                        .filter(r => r.business_status !== 'CLOSED_PERMANENTLY')
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 6);
                    setSuggestions(sorted);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setSuggestions([]);
                } else {
                    setError(`Google Maps Error: ${status}`);
                }
            });
        } catch (err) {
            console.error(err);
            setError(err.message);
            setIsLoading(false);
        }
    }, [isOpen, activeLocation, activeShoppingType, budget?.categoryId, isLoaded]);

    const handleManualSearch = (e) => {
        e.preventDefault();
        setActiveLocation(manualInput.trim());
        setActiveShoppingType(finalShoppingType);
    };

    const handleMapSearch = () => {
        if (mapLocation) {
            setActiveLocation(mapLocation);
            setActiveShoppingType(finalShoppingType);
        }
    };

    if (!isOpen) return null;

    const currentInputLocation = activeTab === 'manual' ? manualInput : mapLocation;
    const canSearch = activeTab === 'map' ? !!mapLocation : !!manualInput.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Hidden div for Google Maps PlacesService requirement. Must not be display: none for some map versions */}
            <div style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
                <div ref={mapRef} style={{ width: '100px', height: '100px' }}></div>
            </div>

            {/* Panel */}
            <div className="relative w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in fade-in sm:zoom-in-95 slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-200 max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Smart Suggestions</h2>
                            <p className="text-xs text-zinc-500">
                                {budget?.category?.icon} {budget?.category?.name} — Best places to spend wisely
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Filters Section */}
                <div className="px-6 pt-4 pb-3 border-b border-zinc-800/50 bg-zinc-900/20 shrink-0 space-y-4">
                    
                    {/* Shopping Type Filter (Only show for Shopping/Groceries/etc) */}
                    {["shopping", "groceries", "food", "dining", "entertainment"].includes(budget?.category?.name?.toLowerCase() || '') && (
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 font-medium ml-1">What are you looking for?</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={shoppingType}
                                        onChange={(e) => setShoppingType(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="">Any (General Suggestions)</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="jewelry">Jewelry</option>
                                        <option value="flowers">Flowers</option>
                                        <option value="shoes">Shoes</option>
                                        <option value="house things">House Things / Goods</option>
                                        <option value="groceries">Groceries</option>
                                        <option value="other">Other (Type your own)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {shoppingType === 'other' && (
                                    <input
                                        type="text"
                                        placeholder="Type here..."
                                        value={customShoppingType}
                                        onChange={(e) => setCustomShoppingType(e.target.value)}
                                        className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Location Input Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Where?</label>
                            <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 w-fit">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                activeTab === 'manual'
                                    ? 'bg-purple-600 text-white shadow'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Keyboard size={12} />
                            Type Location
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                activeTab === 'map'
                                    ? 'bg-purple-600 text-white shadow'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Map size={12} />
                            Pick on Map
                        </button>
                    </div>
                </div>

                    {/* Tab content */}
                    {activeTab === 'manual' ? (
                        <form onSubmit={handleManualSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="E.g., Colombo, Mount Lavinia, Kandy…"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || (!manualInput.trim() && !shoppingType)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                                Search
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-2">
                            <GooglePlacePicker onPlaceSelected={setMapLocation} isLoaded={isLoaded} loadError={loadError} />
                            {(mapLocation || shoppingType) && (
                                <button
                                    onClick={handleMapSearch}
                                    disabled={isLoading}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                                >
                                    {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                    Find Places
                                </button>
                            )}
                        </div>
                    )}
                    </div>

                    {/* Active location/type badge */}
                    {(activeLocation || activeShoppingType) && (
                        <p className="text-[10px] text-zinc-500 flex items-center flex-wrap gap-1">
                            <Sparkles size={9} className="text-purple-400" />
                            Showing suggestions
                            {activeShoppingType && <span>for <span className="text-zinc-300 font-semibold">{activeShoppingType}</span></span>}
                            {activeLocation && <span>near <span className="text-zinc-300 font-semibold">{activeLocation}</span></span>}
                        </p>
                    )}
                </div>

                {/* Suggestions Content */}
                <div className="p-6 overflow-y-auto flex-1 relative min-h-[250px]">

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 h-full">
                            <Loader2 size={28} className="animate-spin text-purple-400" />
                            <p className="text-sm text-zinc-500">Searching Google Maps…</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 h-full flex flex-col justify-center">
                            <p className="text-sm text-red-400">{error}</p>
                            <p className="text-xs text-zinc-500 mt-1">Please try again later</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map((place, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-500/30 transition-all group flex flex-col gap-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700">
                                            {place.photos && place.photos.length > 0 ? (
                                                <img 
                                                    src={place.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 })} 
                                                    alt={place.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <MapPin className="text-zinc-500" size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-white text-sm line-clamp-1 pr-2">{place.name}</h4>
                                                {place.rating && (
                                                    <span className="text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                                        {place.rating} <Star size={9} className="fill-yellow-400" />
                                                        <span className="text-zinc-500 font-normal ml-0.5">({place.user_ratings_total})</span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                                                {place.formatted_address}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                            <span className={`w-1.5 h-1.5 rounded-full ${place.opening_hours?.isOpen() ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="text-zinc-500 uppercase tracking-wider font-medium">
                                                {place.opening_hours?.isOpen() ? 'Open Now' : 'Closed'}
                                            </span>
                                        </div>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.formatted_address)}&query_place_id=${place.place_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                                        >
                                            View on Map <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            ))}

                            {suggestions.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="p-3 bg-zinc-800/50 rounded-full inline-block mb-3">
                                        <MapPin size={22} className="text-zinc-600" />
                                    </div>
                                    <p className="text-sm text-zinc-500">
                                        {(activeLocation || activeShoppingType)
                                            ? 'No suggestions found for these filters'
                                            : 'Enter a location or type above to get personalised suggestions'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-zinc-800 shrink-0">
                    <p className="text-[10px] text-zinc-600 text-center flex justify-center items-center gap-1.5">
                        <Map size={12} className="text-zinc-500" /> Results provided by Google Maps
                    </p>
                </div>
            </div>
        </div>
    );
}
