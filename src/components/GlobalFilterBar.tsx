
import React from 'react';
import { Calendar, MapPin, Package, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Checkbox } from './ui/checkbox';
import { useFilterStore } from '../state/useFilterStore';
import { format } from 'date-fns';

export const GlobalFilterBar: React.FC = () => {
  const { 
    dateRange, 
    setDateRange, 
    barangays, 
    setBarangays, 
    categories, 
    setCategories, 
    brands, 
    setBrands,
    getMasterLists 
  } = useFilterStore();

  const masterLists = getMasterLists();

  return (
    <div className="bg-white dark:bg-scout-navy border-b border-gray-200 dark:border-scout-dark px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.from && dateRange.to 
                ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                : 'Select dates'
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={(range) => range && setDateRange(range)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Location Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <MapPin className="mr-2 h-4 w-4" />
              Locations ({barangays.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Locations</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {masterLists.allRegions.map((region) => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={region}
                      checked={barangays.includes(region)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBarangays([...barangays, region]);
                        } else {
                          setBarangays(barangays.filter(b => b !== region));
                        }
                      }}
                    />
                    <label htmlFor={region} className="text-sm">{region}</label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Category Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Package className="mr-2 h-4 w-4" />
              Categories ({categories.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Categories</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {masterLists.allCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCategories([...categories, category]);
                        } else {
                          setCategories(categories.filter(c => c !== category));
                        }
                      }}
                    />
                    <label htmlFor={category} className="text-sm">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Brand Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Tag className="mr-2 h-4 w-4" />
              Brands ({brands.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Brands</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {masterLists.allBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={brands.includes(brand)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBrands([...brands, brand]);
                        } else {
                          setBrands(brands.filter(b => b !== brand));
                        }
                      }}
                    />
                    <label htmlFor={brand} className="text-sm">{brand}</label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Count */}
        {(barangays.length > 0 || categories.length > 0 || brands.length > 0) && (
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setBarangays([]);
                setCategories([]);
                setBrands([]);
              }}
              className="text-scout-teal hover:text-scout-teal/80"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
