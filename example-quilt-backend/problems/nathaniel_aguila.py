from dimod import ConstrainedQuadraticModel, Binary
import numpy as np

def parseData(data):
   S = data["companyData"][0]['suppliers'] # number of suppliers
   D = data["companyData"][0]['stock_need'] # number of days restock is needed
   n = data["companyData"][0]['units'] # number of prodcuts needed

   u = np.zeros((S))
   c = np.zeros((S))
   d = np.zeros((S))

   # number of units the supplier can provide - could order less than this too?
   for i in range(S):
      u[i] = data["supplierData"][i]['bulk_units']

   # cost that each supplier charges
   for i in range(S):
      c[i] = data["supplierData"][i]['total_cost']

   # number of days that it takes each supplier to provide products
   for i in range(S):
      d[i] = data["supplierData"][i]['lead_time']
   
   O = 0 # maximum number of orders you can place
   if(min(d) != 0):
      O = int(D / min(d))
   
   return (S, D, n, u, c, d, O)

def main(data): #REQUIRED FUNCTION
    S, D, n, u, c, d, O = parseData(data)

   #Need to return this
    cqm = ConstrainedQuadraticModel()

    # Defining and adding variables to the CQM model 
    x = {(s, o): Binary(str(s) + "_" + str(o)) for s in range(S) for o in range(O)}

    # Defining the objective function
    cqm.set_objective(sum(c[s] * x[s, o] for s in range(S) for o in range(O)))

    # Add demand constraint (>= n)
    cqm.add_constraint(sum(u[s] * x[s, o] for s in range(S) for o in range(O)) >= n, label="demand")

    # Add time constraint (<= D)
    cqm.add_constraint(sum(d[s] * x[s, o] for s in range(S) for o in range(O)) <= D, label="time")

    return cqm