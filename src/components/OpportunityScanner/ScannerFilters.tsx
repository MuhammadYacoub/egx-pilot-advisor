
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export const ScannerFilters = () => {
  return (
    <Card className="bg-slate-700/30 border-slate-600/50 p-6 mt-4">
      <h4 className="font-semibold text-white mb-4">Advanced Filters</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-slate-300">Price Range (EGP)</Label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Min" 
              className="bg-slate-600/50 border-slate-500 text-white"
            />
            <Input 
              type="number" 
              placeholder="Max" 
              className="bg-slate-600/50 border-slate-500 text-white"
            />
          </div>
        </div>

        {/* Market Cap */}
        <div className="space-y-2">
          <Label className="text-slate-300">Market Cap</Label>
          <Select>
            <SelectTrigger className="bg-slate-600/50 border-slate-500 text-white">
              <SelectValue placeholder="Select market cap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              <SelectItem value="small">Small Cap (&lt; 1B EGP)</SelectItem>
              <SelectItem value="mid">Mid Cap (1B - 10B EGP)</SelectItem>
              <SelectItem value="large">Large Cap (&gt; 10B EGP)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label className="text-slate-300">Sector</Label>
          <Select>
            <SelectTrigger className="bg-slate-600/50 border-slate-500 text-white">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="banking">Banking</SelectItem>
              <SelectItem value="real_estate">Real Estate</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="telecom">Telecommunications</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Score */}
        <div className="space-y-2">
          <Label className="text-slate-300">Minimum Opportunity Score</Label>
          <div className="px-2">
            <Slider
              defaultValue={[70]}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>70%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <Label className="text-slate-300">Min Daily Volume (EGP)</Label>
          <Input 
            type="number" 
            placeholder="e.g., 1000000" 
            className="bg-slate-600/50 border-slate-500 text-white"
          />
        </div>

        {/* Technical Signals */}
        <div className="space-y-2">
          <Label className="text-slate-300">Technical Pattern</Label>
          <Select>
            <SelectTrigger className="bg-slate-600/50 border-slate-500 text-white">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patterns</SelectItem>
              <SelectItem value="breakout">Breakout</SelectItem>
              <SelectItem value="wyckoff">Wyckoff Accumulation</SelectItem>
              <SelectItem value="candlestick">Bullish Candlestick</SelectItem>
              <SelectItem value="momentum">Momentum Reversal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
