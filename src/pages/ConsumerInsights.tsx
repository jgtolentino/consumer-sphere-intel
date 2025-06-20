
import { useState, useEffect } from 'react';
import { Users, MapPin, TrendingUp, Target } from 'lucide-react';

const ConsumerInsights: React.FC = () => {
  
  // TODO: Replace with proper data service call
  const [demographicData, setDemographicData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Replace this with actual data service call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const data = await dataService.getData();
        // setDemographicData(data);
        setDemographicData([]); // Temporary empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const ageGroups = [
    { label: '18-25', percentage: 25, color: 'bg-green-500' },
    { label: '26-35', percentage: 32, color: 'bg-blue-500' },
    { label: '36-45', percentage: 28, color: 'bg-purple-500' },
    { label: '46-55', percentage: 12, color: 'bg-orange-500' },
    { label: '55+', percentage: 3, color: 'bg-gray-500' }
  ];

  const topBarangays = [
    { name: 'Poblacion', transactions: 15847, revenue: 2340000 },
    { name: 'San Antonio', transactions: 12456, revenue: 1890000 },
    { name: 'Santa Maria', transactions: 9832, revenue: 1456000 },
    { name: 'San Jose', transactions: 8734, revenue: 1234000 },
    { name: 'Barangay 1', transactions: 7654, revenue: 987000 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consumer Insights</h1>
          <p className="text-gray-600 mt-1">Understand customer demographics and behavior patterns</p>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-xl font-bold text-gray-900">48,562</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Purchases/Month</p>
              <p className="text-xl font-bold text-gray-900">3.4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Retention</p>
              <p className="text-xl font-bold text-gray-900">73%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Coverage Areas</p>
              <p className="text-xl font-bold text-gray-900">127</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Gender Distribution</h3>
          <div className="space-y-4">
            {demographicData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm text-gray-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Age Groups</h3>
          <div className="space-y-3">
            {ageGroups.map((group, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">{group.label}</span>
                  <span className="text-sm text-gray-600">{group.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${group.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${group.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavior Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Purchase Funnel</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Funnel chart showing customer journey from awareness to purchase</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Geographic Heat Map</h3>
          <div className="h-80 flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">Interactive map showing customer density by barangay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Barangays Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Barangays</h3>
          <p className="text-gray-600 text-sm mt-1">Highest transaction volume and revenue by location</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barangay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Transaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topBarangays.map((barangay, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{barangay.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {barangay.transactions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₱{barangay.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{Math.round(barangay.revenue / barangay.transactions).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsumerInsights;
